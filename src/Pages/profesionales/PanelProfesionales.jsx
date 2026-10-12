import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Sparkles, CheckCircle2, Edit3, Save, RefreshCw, AlertCircle, 
  Plus, Tag, ArrowRight, AlertTriangle, 
  Loader2, Eye, EyeOff, LogOut, X, Share2, Copy, Image as ImageIcon, Trash2, ChevronDown, FileText, Check
} from 'lucide-react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc, collection, setDoc, onSnapshot, addDoc, deleteDoc, query, where  } from 'firebase/firestore';
import { auth, db } from '../../components/firebase';
import Wallet from './Wallet'
import Comunidad from './Comunidad';

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
  const [dragOverInfo, setDragOverInfo] = useState({ diaStr: null, horaTexto: null, x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('facturacion');
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
  const [pestanaActiva, setPestanaActiva] = useState('externos');
  const [menuAgendaAbierto, setMenuAgendaAbierto] = useState(false);
  const [modalBloqueoAbierto, setModalBloqueoAbierto] = useState(false);
  const [modalNuevaCitaAbierto, setModalNuevaCitaAbierto] = useState(false);
  const [datosBloqueo, setDatosBloqueo] = useState({ 
    fechaStr: new Date().toISOString().split('T')[0], 
    horaInicio: '12:00 a. m.', 
    horaFin: '7:00 a. m.', 
    motivo: 'No disponible' 
  });

  const [porcentaje, setPorcentaje] = useState('');

  const [datosNuevaCita, setDatosNuevaCita] = useState({
    clienteNombre: '',
    telefono: '',
    servicio: '',
    fechaStr: new Date().toISOString().split('T')[0],
    hora: '12:00 a. m.'
  });

  const actualizarBloqueoArrastrado = async (bloqueo, nuevaFechaStr, nuevaHoraInicio, nuevaHoraFin) => {
    try {
      const bloqueoId = bloqueo.id || bloqueo.uid;
      if (!bloqueoId) return;

      const minInicio = convertirHoraAMinutos(nuevaHoraInicio, true);
      const minFin = convertirHoraAMinutos(nuevaHoraFin, true);
      let duracionTotal = minFin - minInicio;
      if (duracionTotal <= 0) duracionTotal += 1440;

      const bloqueoRef = doc(db, "bloqueos", bloqueoId);
      
      const datosActualizados = {
        fechaStr: nuevaFechaStr,
        fecha: nuevaFechaStr,
        horaInicio: nuevaHoraInicio,
        hora: nuevaHoraInicio,
        horaFin: nuevaHoraFin,
        duracionTotal: duracionTotal
      };

      await updateDoc(bloqueoRef, datosActualizados);

      setCitasFirestore(prev => 
        prev.map(c => ((c.id || c.uid) === bloqueoId ? { ...c, ...datosActualizados } : c))
      );
    } catch (error) {
      console.error("Error al actualizar el bloqueo arrastrado:", error);
      alert("Hubo un error al mover el bloqueo. Inténtalo de nuevo.");
    }
  };

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
        window.location.href = '/loginprofesionales';
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

  const [barberData, setBarberData] = useState(null);
  
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
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);

  const [modalHorarioSemanalAbierto, setModalHorarioSemanalAbierto] = useState(false);
const [horarioSemanal, setHorarioSemanal] = useState({
  lunes: { abierto: true, apertura: '8:00 a. m.', cierre: '7:00 p. m.' },
  martes: { abierto: true, apertura: '8:00 a. m.', cierre: '7:00 p. m.' },
  miercoles: { abierto: true, apertura: '8:00 a. m.', cierre: '7:00 p. m.' },
  jueves: { abierto: true, apertura: '8:00 a. m.', cierre: '7:00 p. m.' },
  viernes: { abierto: true, apertura: '8:00 a. m.', cierre: '7:00 p. m.' },
  sabado: { abierto: true, apertura: '8:00 a. m.', cierre: '7:00 p. m.' },
  domingo: { abierto: false, apertura: '8:00 a. m.', cierre: '7:00 p. m.' }
});

  const [horaInicioLaboral, setHoraInicioLaboral] = useState('8:00 a. m.');
const [horaFinLaboral, setHoraFinLaboral] = useState('7:00 p. m.');

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

  const abrirModalEdicionBloqueo = (itemCita) => {
  setCitaSeleccionada(itemCita);
  
  // Rellenar estados del modal con los datos del bloqueo seleccionado
  setNuevoMotivoBloqueo(itemCita.motivo || 'No disponible');
  setNuevaFechaCita(itemCita.fechaStr || itemCita.fecha || new Date().toISOString().split('T')[0]);
  setNuevaHoraCita(itemCita.horaInicio || itemCita.hora || '12:00 a. m.');
  setNuevaHoraFinCita(itemCita.horaFin || '1:00 a. m.');
  
  // Abrir el modal de edición/gestión de bloqueo
  setModalBloqueoAbierto(true);
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

  const aceptarVinculacion = async () => {
    try {
      const profRef = doc(db, 'profesionales', authUser.uid);
      await updateDoc(profRef, {
        estadoVinculacion: 'aceptado'
      });
      setSuccessMsg('¡Te has vinculado exitosamente al establecimiento!');
    } catch (err) {
      console.error("Error al aceptar:", err);
    }
  };

  const rechazarVinculacion = async () => {
    try {
      const profRef = doc(db, 'profesionales', authUser.uid);
      await updateDoc(profRef, {
        establecimientoId: '',
        establecimientoNombre: '',
        estadoVinculacion: 'rechazado'
      });
    } catch (err) {
      console.error("Error al rechazar:", err);
    }
  };

  // EFECTO PRINCIPAL CORREGIDO (Aquí se cargan citas y los bloqueos exclusivamente de la colección "bloqueos")
  useEffect(() => {
    let unsubFirestoreStatus = () => {};
    let unsubServicios = () => {};
    let unsubCitas = () => {};
    let unsubBloqueos = () => {};

    const calcTime = () => {
      const now = new Date();
      setCurrentTimeMinutes(Math.max(0, Math.min(100, ((now.getHours() * 60 + now.getMinutes()) / 1440) * 100)));
    };
    calcTime();
    const t = setInterval(calcTime, 30000);

    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setAuthUser(currentUser);

        unsubFirestoreStatus = onSnapshot(doc(db, 'profesionales', currentUser.uid), (docSnap) => {
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
            setCorreoPerfil(d.correo || currentUser.email || '');
            setPorcentaje(d.porcentaje !== undefined && d.porcentaje !== null ? d.porcentaje : '');
            setZonasTrabajo(d.zonasTrabajo || []);
          } else {
            setCorreoPerfil(currentUser.email || '');
          }
        }, (error) => {
          console.error("Error al verificar estado del profesional:", error);
        });

        const nombreBarberoActual = nombre;
        
        // 1. Cargar Servicios
        const qServicios = query(collection(db, 'servicios'), where('barberoId', '==', currentUser.uid));
        unsubServicios = onSnapshot(qServicios, (servSnap) => {
          const listaServicios = [];
          servSnap.forEach(docServ => {
            listaServicios.push({ id: docServ.id, ...docServ.data() });
          });
          setServiciosFirebase(listaServicios);
        });

        let citasTemp = [];
        let bloqueosTemp = [];

        const actualizarEstadoGlobal = () => {
          setCitasFirestore([...citasTemp, ...bloqueosTemp]);
        };

        // 2. Cargar Citas normales (excluyendo bloqueos)
        const qCitas = query(collection(db, 'citas'), where('barberoId', '==', currentUser.uid));
        unsubCitas = onSnapshot(qCitas, (snapshot) => {
          citasTemp = [];
          let idsActuales = citasFirestore.map(c => c.id);

          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const coincideId = data.barberoId === currentUser.uid;
            const coincideNombre = (nombreBarberoActual && data.barberoName && data.barberoName.toLowerCase().trim() === nombreBarberoActual.toLowerCase().trim());

            if (data.estado === 'bloqueado' || data.esBloqueo === true) return;

            if (coincideId || coincideNombre || !data.barberoId) {
              let horaBD = (data.hora || '').trim();
              
              if (horaBD.includes(':') && !horaBD.toLowerCase().includes('m') && !horaBD.toLowerCase().includes('a')) {
                const partes = horaBD.split(':');
                let hNum = parseInt(partes[0], 10);
                const mNum = partes[1] || '00';
                if (!isNaN(hNum)) {
                  const ampm = hNum >= 12 ? 'p. m.' : 'a. m.';
                  const h12 = hNum % 12 || 12;
                  horaBD = `${h12}:${mNum.substring(0, 2)} ${ampm}`;
                }
              }

              const matchHora = horasCalendario.find(h => 
                h.val24 === data.hora || 
                h.label.toLowerCase() === horaBD.toLowerCase() ||
                horaBD.toLowerCase().includes(h.val24) ||
                horaBD.toLowerCase().replace(/\s+/g, '').includes(h.label.toLowerCase().replace(/\s+/g, ''))
              );

              const horaNormalizada = matchHora ? matchHora.label : (horaBD || '12:00 a. m.');
              const estado = (data.estado || 'pendiente').toLowerCase();
              
              if (!primerCargaRef.current && !idsActuales.includes(docSnap.id) && estado !== 'cancelada' && estado !== 'cancelado') {
                reproducirSonidoAlerta();
              }

              let colorClase = 'bg-indigo-50 border-indigo-200 text-indigo-950 font-semibold shadow-xs';
              if (estado === 'confirmada' || estado === 'confirmado') colorClase = 'bg-emerald-50 border-emerald-200 text-emerald-950 font-semibold shadow-xs';
              if (estado === 'finalizada' || estado === 'finalizado') colorClase = 'bg-slate-100 border-slate-200 text-slate-400 font-normal';
              if (estado === 'cancelada' || estado === 'cancelado') colorClase = 'bg-rose-50 border-rose-200 text-rose-700 font-normal opacity-75';
              
              citasTemp.push({
                ...data,
                id: docSnap.id, 
                cliente: data.clienteNombre || 'CLIENTE', 
                clienteTelefono: data.telefono || data.clienteTelefono || '',
                clienteEmail: data.clienteEmail || '', 
                servicio: data.servicio || 'Servicio General',
                hora: horaNormalizada, 
                horaFin: data.horaFin || '',
                duracionTotal: data.duracionTotal || 45,
                fechaStr: data.fecha || '', 
                estado, 
                color: colorClase, 
                esBloqueo: false
              });
            }
          });

          actualizarEstadoGlobal();
        });

        // 3. Cargar Bloqueos EXCLUSIVAMENTE de la colección "bloqueos"
        const qBloqueos = query(collection(db, 'bloqueos'), where('barberoId', '==', currentUser.uid));
        unsubBloqueos = onSnapshot(qBloqueos, (snapBloq) => {
          bloqueosTemp = [];
          snapBloq.forEach(docBloq => {
            const bData = docBloq.data();
            bloqueosTemp.push({
              id: docBloq.id,
              ...bData,
              cliente: 'BLOQUEADO',
              clienteNombre: 'BLOQUEADO',
              servicio: 'Bloqueo de Horario',
              estado: 'bloqueado',
              esBloqueo: true,
              fechaStr: bData.fechaStr || bData.fecha,
              hora: bData.horaInicio || bData.hora,
             color: 'bg-slate-100/90 border-slate-300 text-slate-700 font-medium select-none cursor-pointer backdrop-blur-xs hover:bg-slate-200/90'
            });
          });

          // Generación automática de notificaciones
          const listaNotif = bloqueosTemp.map(b => ({
            id: b.id,
            texto: `Horario bloqueado: ${b.motivo || 'No disponible'} (${b.fechaStr})`,
            icono: '🚫',
            fecha: b.fechaStr || 'Hoy'
          }));
          setNotificaciones(listaNotif.reverse());

          actualizarEstadoGlobal();
          primerCargaRef.current = false;
        });

      } else { 
        setAuthUser(null); 
        setCitasFirestore([]); 
        setServiciosFirebase([]);
        setNotificaciones([]);
      }
      setAuthLoading(false);
    });

    const safety = setTimeout(() => setAuthLoading(false), 2000);
    return () => { 
      unsubAuth(); 
      clearTimeout(safety); 
      clearInterval(t); 
      unsubFirestoreStatus();
      unsubServicios();
      unsubCitas();
      unsubBloqueos();
    };
  }, [nombre]);

  const [serviciosModalCita, setServiciosModalCita] = useState([]);

  const abrirModalCita = (cita) => {
    setCitaSeleccionada(cita);
    setNuevaFechaCita(cita.fechaStr || cita.fecha || '');
    setNuevaHoraCita(cita.hora || '');
    setNuevaHoraFinCita(cita.horaFin || 'No disponible');
    setNuevoMotivoBloqueo(cita.motivo || 'No disponible');
    
    if (cita.servicios && Array.isArray(cita.servicios)) {
      setServiciosModalCita(cita.servicios);
    } else if (cita.servicio) {
      setServiciosModalCita([{ nombre: cita.servicio, precio: cita.monto || cita.precioTotal || '$0' }]);
    } else {
      setServiciosModalCita([]);
    }
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

  if (authLoading) return (
    <div className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 select-none">
      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border border-blue-200 shadow-xl flex items-center justify-center p-2.5 mb-4 animate-pulse">
        <img 
          src="https://res.cloudinary.com/dtkirmtfq/image/upload/v1791241981/Visarka/mxmsobksbvrii384mlja.png" 
          alt="VISARKA" 
          className="w-full h-full object-contain"
        />
      </div>
      <h1 className="text-slate-900 text-xs font-black uppercase tracking-widest">VISARKA</h1>
      <p className="text-blue-600 text-[10px] font-mono tracking-wider mt-1">Cargando Portal Profesional...</p>
      <div className="w-32 h-1 bg-blue-100 rounded-full mt-6 overflow-hidden">
        <div className="w-full h-full bg-blue-600 animate-[indeterminate_1s_infinite_linear]"></div>
      </div>
    </div>
  );

  const diasVisibles = getDiasVisibles();
  const linkReserva = `${window.location.origin}/reservar/${authUser?.uid}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-mono flex flex-col justify-between pb-36 relative select-none">
     <header className="w-full bg-white border-b border-slate-200 px-3 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-blue-200 flex items-center justify-center shadow-sm p-1">
            <img 
              src="https://res.cloudinary.com/dtkirmtfq/image/upload/v1791241981/Visarka/mxmsobksbvrii384mlja.png" 
              alt="Logo ARKANAVISION" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase text-slate-900">Hola, {nombre.split(' ')[0]}</span>
            <span className="text-[8px] text-slate-400 font-bold">VISARKA • {ciudad} • {especialidad}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          <div className="relative">
           <button 
              onClick={() => setNotificacionesAbiertas(!notificacionesAbiertas)}
              className="p-2 rounded-xl bg-blue-50/80 hover:bg-blue-100 border border-blue-200 text-blue-600 cursor-pointer relative transition-all shadow-2xs flex items-center justify-center active:scale-95"
              title="Notificaciones"
            >
              <span className="text-sm">🔔</span>
              {notificaciones.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-full text-[8px] font-black flex items-center justify-center shadow-xs animate-pulse">
                  {notificaciones.length}
                </span>
              )}
            </button>

           {notificacionesAbiertas && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="text-[10px] font-black uppercase text-slate-900">Notificaciones de Actividad</span>
                  <button 
                    onClick={() => setNotificacionesAbiertas(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1.5">
                  {barberData?.establecimientoId && barberData?.estadoVinculacion === 'pendiente' && (
                    <div className="p-2 rounded-xl bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 flex items-center justify-between gap-2 text-[10px] shadow-2xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-xs p-1 bg-white rounded-lg border border-blue-100 shadow-2xs shrink-0">🏢</span>
                        <div className="truncate">
                          <p className="font-black text-blue-950 leading-tight">Solicitud de Vinculación</p>
                          <p className="text-slate-600 truncate mt-0.5">
                            <strong className="text-slate-900">{barberData.establecimientoNombre || 'Establecimiento'}</strong> te invitó.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button 
                          onClick={aceptarVinculacion}
                          className="w-6 h-6 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-black flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 text-xs"
                          title="Aceptar"
                        >
                          ✓
                        </button>
                        <button 
                          onClick={rechazarVinculacion}
                          className="w-6 h-6 rounded-md bg-rose-100 hover:bg-rose-200 text-rose-600 border border-rose-200 font-black flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 text-xs"
                          title="Rechazar"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                  {notificaciones.length === 0 && (!barberData?.establecimientoId || barberData?.estadoVinculacion !== 'pendiente') ? (
                    <div className="py-6 text-center text-slate-400 text-[10px] italic">
                      No hay notificaciones recientes.
                    </div>
                  ) : (
                    notificaciones.map((notif) => (
                      <div 
                        key={notif.id} 
                        className="p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-blue-50/50 transition flex items-start gap-2 text-[10px]"
                      >
                        <span className="text-sm shrink-0">{notif.icono}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 leading-tight">{notif.texto}</p>
                          <span className="text-[8px] text-slate-400 mt-0.5 block">{notif.fecha}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button onClick={() => setActiveTab('estadisticas')} className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 cursor-pointer">
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
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

          <div className="relative w-full h-full flex-1 min-h-[75vh] flex flex-col select-none rounded-2xl border border-blue-200 bg-white mb-2 text-slate-900 shadow-sm">
            <div className="bg-white relative w-full h-full flex flex-col flex-1 overflow-y-auto overflow-x-hidden rounded-2xl">
              <div className="sticky top-0 z-45 bg-blue-50/95 backdrop-blur-md flex-shrink-0 shadow-[0_12px_24px_-4px_rgba(37,99,235,0.3)] border-b-2 border-blue-300">
                <div className="grid text-center text-[11px] font-medium uppercase tracking-wider text-blue-900 py-1" style={{ gridTemplateColumns: `70px repeat(${diasVisibles.length}, minmax(0, 1fr))` }}>
                  <div className="text-left pl-4 py-3 text-blue-600 font-bold text-[10px] border-r border-blue-200 bg-blue-100 sticky left-0 z-50 flex items-center shadow-[4px_0_12px_-2px_rgba(37,99,235,0.15)]">Hora</div>
                  {diasVisibles.map((d, i) => {
                    const esHoy = d.fechaObj.toDateString() === new Date().toDateString();
                    const esSeleccionado = d.fechaObj.toDateString() === fechaSeleccionada.toDateString();

                    return (
                      <div key={i} className="py-2.5 px-1 border-r border-blue-200/70 last:border-r-0 flex flex-col items-center justify-center transition-all bg-blue-50/95">
                        <div className={`w-9 h-9 rounded-full flex flex-col items-center justify-center ${
                          esHoy 
                            ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-500/20' 
                            : esSeleccionado 
                              ? 'bg-blue-100 text-blue-950 font-bold border border-blue-300' 
                              : 'text-slate-700 hover:bg-blue-100/50'
                        }`}>
                          <span className="text-xs font-bold leading-none">{d.num}</span>
                          <span className="text-[8px] font-normal leading-tight opacity-75">{d.nombre.toLowerCase()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="relative flex-1" onClick={() => menuAgendaAbierto && setMenuAgendaAbierto(false)}>
                {dragOverInfo.horaTexto && (
                  <div className="absolute z-40 pointer-events-none bg-blue-600 text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg shadow-xl border border-blue-400 backdrop-blur-md"
                       style={{ top: `${Math.max(10, dragOverInfo.y - 40)}px`, left: '50%', transform: 'translateX(-50%)' }}>
                    📍 Mover a: <span className="underline font-bold">{dragOverInfo.horaTexto}</span>
                  </div>
                )}

                {/* Bucle de celdas de la agenda */}
{horasCalendario.map((itemHora, idx) => {
  const [fH, fM] = itemHora.val24.split(':').map(Number);
  const minutosFilaInicio = fH * 60 + fM;
  const minutosFilaFin = minutosFilaInicio + 60;

  return (
    <div 
      key={idx} 
      className="grid items-stretch min-h-[72px] border-b border-blue-100 text-[10px]" 
      style={{ gridTemplateColumns: `70px repeat(${diasVisibles.length}, minmax(0, 1fr))` }}
    >
      {/* Columna lateral de la hora */}
      {diasVisibles.map((dia, dIdx) => {
        const diasSemanaNombres = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const nombreDiaSemana = diasSemanaNombres[dia.fechaObj.getDay()];
        const configDiaActual = (barberData?.horarioSemanal || horarioSemanal)?.[nombreDiaSemana] || { abierto: true, apertura: '8:00 a. m.', cierre: '7:00 p. m.' };
        
        const estaCerradoHoy = !configDiaActual.abierto;
        const minInicioLab = horaAMinutos(configDiaActual.apertura || '8:00 a. m.');
        const minFinLab = horaAMinutos(configDiaActual.cierre || '7:00 p. m.');
        const esFueraDeHorario = estaCerradoHoy || minutosFilaInicio < minInicioLab || minutosFilaInicio >= minFinLab;

        if (dIdx === 0) {
          return (
            <div 
              key={`hora-${idx}`}
              className={`border-r border-blue-200 px-2 font-sans text-[10px] font-semibold flex flex-col items-center justify-start pt-2 sticky left-0 z-30 transition-colors ${
                esFueraDeHorario 
                  ? 'bg-slate-200/60 text-slate-400 line-through' 
                  : 'bg-blue-50/95 text-blue-700'
              }`}
            >
              <span>{itemHora.label.toLowerCase()}</span>
            </div>
          );
        }
        return null;
      })}

      {/* Celdas de días para cada hora */}
      {diasVisibles.map((dia, dIdx) => {
        const fechaStr = dia.fechaObj.toISOString().split('T')[0];
        const diasSemanaNombres = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const nombreDiaSemana = diasSemanaNombres[dia.fechaObj.getDay()];
        const configDiaActual = (barberData?.horarioSemanal || horarioSemanal)?.[nombreDiaSemana] || { abierto: true, apertura: '8:00 a. m.', cierre: '7:00 p. m.' };

        const estaCerradoHoy = !configDiaActual.abierto;
        const minInicioLab = horaAMinutos(configDiaActual.apertura || '8:00 a. m.');
        const minFinLab = horaAMinutos(configDiaActual.cierre || '7:00 p. m.');
        const esFueraDeHorario = estaCerradoHoy || minutosFilaInicio < minInicioLab || minutosFilaInicio >= minFinLab;

        // Citas normales que inician en esta hora
        const citasEnEstaHora = citasFirestore.filter(c => {
          const fDoc = c.fechaStr || c.fecha;
          if (fDoc !== fechaStr || !c.hora || c.esBloqueo) return false;
          const minutosCitaInicio = horaAMinutos(c.hora);
          return minutosCitaInicio >= minutosFilaInicio && minutosCitaInicio < minutosFilaFin;
        });

        // Bloqueos que INICIAN exactamente en esta hora (para dibujar un único recuadro continuo hacia abajo)
        const bloqueosInicianAqui = citasFirestore.filter(c => {
          const fDoc = c.fechaStr || c.fecha;
          if (fDoc !== fechaStr || !c.esBloqueo) return false;
          const horaRef = c.horaInicio || c.hora;
          if (!horaRef) return false;
          const minutosBloqInicio = horaAMinutos(horaRef);
          return minutosBloqInicio >= minutosFilaInicio && minutosBloqInicio < minutosFilaFin;
        });

        const elementosEnEstaHora = [...bloqueosInicianAqui, ...citasEnEstaHora];

        return (
          <div 
            key={dIdx} 
            className={`border-r border-blue-100/60 last:border-r-0 p-1 relative flex flex-row gap-0.5 items-stretch transition-colors ${
              esFueraDeHorario ? 'bg-slate-100/80' : 'bg-white'
            }`}
          >
            {/* Si es fuera de horario o día cerrado y no hay nada encima */}
            {esFueraDeHorario && elementosEnEstaHora.length === 0 && (
              <div className="absolute inset-0 bg-slate-200/30 pointer-events-none" />
            )}

            {/* Renderizado de Bloqueos (un solo cuadro continuo) y Citas */}
          {elementosEnEstaHora.map((itemCita, cIdx) => {
  const horaInicioRef = itemCita.horaInicio || itemCita.hora;
  const minutosItemInicio = horaAMinutos(horaInicioRef);
  
  let duracionMin = parseInt(itemCita.duracionTotal || itemCita.duracion || 45, 10);
  if (itemCita.esBloqueo && (itemCita.horaFin || horaInicioRef)) {
    const minInicio = horaAMinutos(horaInicioRef);
    const minFin = horaAMinutos(itemCita.horaFin);
    if (minFin > minInicio) {
      duracionMin = minFin - minInicio;
    } else if (minFin < minInicio) {
      duracionMin = (1440 - minInicio) + minFin;
    }
  }

  const offsetMinutosEnHora = minutosItemInicio - minutosFilaInicio;
  const topPercent = Math.max(0, (offsetMinutosEnHora / 60) * 100);
  const alturaTotalPixeles = (duracionMin / 60) * 72;

  return (
    <div 
      key={cIdx}
      /* AQUÍ SE INTEGRA EL EVENTO ONCLICK EN LA TARJETA DEL BLOQUEO / CITA */
      onClick={(e) => { 
        e.stopPropagation(); 
        if (itemCita.esBloqueo) {
          abrirModalEdicionBloqueo(itemCita);
        } else {
          setCitaSeleccionada(itemCita);
          // abrir modal de cita si tienes uno definido
        }
      }}
      className={`absolute p-2 border transition-all shadow-xs flex flex-col justify-between overflow-hidden rounded-lg cursor-pointer ${
        itemCita.esBloqueo 
          ? 'bg-slate-200/90 border-slate-300 text-slate-700 font-medium select-none hover:bg-slate-300/90' 
          : 'bg-blue-50/90 border-blue-200 text-blue-950 font-medium'
      }`}
      style={{ 
        top: `${topPercent}%`, 
        height: `${Math.max(alturaTotalPixeles, 46)}px`, 
        width: 'calc(100% - 2px)', 
        left: '1px', 
        zIndex: itemCita.esBloqueo ? 50 : 40 
      }}
    >
      <div className="flex justify-between items-start w-full pointer-events-none">
        <span className={`font-medium text-[9px] truncate ${itemCita.esBloqueo ? 'text-slate-700 line-through' : ''}`}>
          {itemCita.esBloqueo ? `🚫 ${itemCita.motivo || 'Horario no disponible'}` : itemCita.cliente}
        </span>
      <span className={`${itemCita.esBloqueo ? 'bg-slate-300/80 border border-slate-400/50 text-slate-700 text-[8px] px-1 py-0.5 rounded font-mono whitespace-nowrap' : 'text-[8px] whitespace-nowrap'}`}>
  {itemCita.esBloqueo ? `${itemCita.horaInicio || itemCita.hora} - ${itemCita.horaFin}` : itemCita.hora}
</span>
      </div>
    </div>
  );
})}
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
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
    <div className="w-full max-w-sm bg-white rounded-2xl p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-xs font-black text-slate-900 uppercase flex items-center gap-1">
            🚫 {citaSeleccionada?.id ? 'GESTIONAR BLOQUEO DE HORARIO' : 'NUEVO BLOQUEO DE HORARIO'}
          </h3>
          <p className="text-[10px] text-indigo-600 font-bold">{nuevoMotivoBloqueo || 'No disponible'}</p>
        </div>
        <button 
          onClick={() => {
            setModalBloqueoAbierto(false);
            setCitaSeleccionada(null);
          }} 
          className="text-slate-400 font-bold cursor-pointer hover:text-slate-600 transition"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3 text-[10px]">
        {/* Motivo del bloqueo */}
        <div className="space-y-1">
          <label className="font-bold text-slate-500 uppercase text-[9px]">MOTIVO DEL BLOQUEO:</label>
          <input 
            type="text" 
            value={nuevoMotivoBloqueo} 
            onChange={(e) => setNuevoMotivoBloqueo(e.target.value)} 
            placeholder="Ej: Almuerzo, Diligencia personal..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-800 outline-none focus:border-indigo-600"
          />
        </div>

        {/* Fecha del bloqueo */}
        <div className="space-y-1">
          <label className="font-bold text-slate-500 uppercase text-[9px]">FECHA DEL BLOQUEO:</label>
          <input 
            type="date" 
            value={nuevaFechaCita} 
            onChange={(e) => setNuevaFechaCita(e.target.value)} 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-800 outline-none focus:border-indigo-600"
          />
        </div>

        {/* Horas Inicio y Fin */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="font-bold text-slate-500 uppercase text-[9px]">HORA INICIO:</label>
            <select 
              value={nuevaHoraCita} 
              onChange={(e) => setNuevaHoraCita(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-[10px] text-slate-800 outline-none focus:border-indigo-600 font-medium"
            >
              {horasCalendario.map((h, i) => (
                <option key={i} value={h.label}>{h.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-500 uppercase text-[9px]">HORA FIN:</label>
            <select 
              value={nuevaHoraFinCita} 
              onChange={(e) => setNuevaHoraFinCita(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-[10px] text-slate-800 outline-none focus:border-indigo-600 font-medium"
            >
              {horasCalendario.map((h, i) => (
                <option key={i} value={h.label}>{h.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Acciones del Modal */}
      <div className="flex gap-2 pt-2">
        {/* El botón de Eliminar SOLO se muestra cuando se está EDITANDO un bloqueo existente */}
        {citaSeleccionada?.id && (
          <button 
            type="button"
            onClick={async () => {
              try {
                setLoading(true);
                await deleteDoc(doc(db, "bloqueos", citaSeleccionada.id));
                setModalBloqueoAbierto(false);
                setCitaSeleccionada(null);
                setSuccessMsg('¡Bloqueo eliminado!');
                setTimeout(() => setSuccessMsg(''), 3000);
              } catch (error) {
                console.error("Error al eliminar el bloqueo:", error);
                setErrorMsg("No se pudo eliminar el bloqueo.");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-2.5 rounded-xl text-[10px] uppercase flex items-center justify-center gap-1 cursor-pointer transition"
          >
            🗑️ Eliminar
          </button>
        )}

        {/* Botón de Guardar / Editar según el caso */}
        <button 
          type="button"
          onClick={async () => {
            try {
              setLoading(true);

              const minInicio = horaAMinutos(nuevaHoraCita);
              const minFin = horaAMinutos(nuevaHoraFinCita);
              let duracionTotal = minFin - minInicio;
              if (duracionTotal <= 0) duracionTotal += 1440;

              const payloadBloqueo = {
                barberoId: authUser.uid,
                motivo: nuevoMotivoBloqueo || 'No disponible',
                fechaStr: nuevaFechaCita,
                fecha: nuevaFechaCita,
                horaInicio: nuevaHoraCita,
                hora: nuevaHoraCita,
                horaFin: nuevaHoraFinCita,
                duracionTotal,
                esBloqueo: true,
                creadoEn: new Date().toISOString()
              };

              if (citaSeleccionada?.id) {
                // EDITAR bloqueo existente
                await updateDoc(doc(db, "bloqueos", citaSeleccionada.id), payloadBloqueo);
                setSuccessMsg('¡Bloqueo actualizado con éxito!');
              } else {
                // CREAR un NUEVO bloqueo en Firestore
                await addDoc(collection(db, "bloqueos"), payloadBloqueo);
                setSuccessMsg('¡Bloqueo guardado con éxito!');
              }

              // Cerrar el modal y limpiar selección de inmediato
              setModalBloqueoAbierto(false);
              setCitaSeleccionada(null);
              setTimeout(() => setSuccessMsg(''), 3000);
            } catch (error) {
              console.error("Error al guardar el bloqueo:", error);
              setErrorMsg('Ocurrió un error al guardar el bloqueo.');
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-[10px] uppercase shadow-xs flex items-center justify-center gap-1 cursor-pointer transition"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            citaSeleccionada?.id ? '✓ GUARDAR CAMBIOS' : '✓ GUARDAR'
          )}
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
          <div className="space-y-3 bg-white p-4 rounded-2xl shadow-sm text-slate-800">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900">Mis Servicios y Paquetes</h3>
                <p className="text-[9px] text-slate-500">Configura los servicios y paquetes que ofreces a tus clientes</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button 
                  type="button"
                  onClick={() => {
                    setServicioEditando(null);
                    setFormServicio({ 
                      nombre: '', 
                      descripcion: '', 
                      precio: '', 
                      duracion: pestanaActiva === 'internos' ? 'interno' : '45 min', 
                      categoria: 'servicio', 
                      color: pestanaActiva === 'internos' ? '#10b981' : '#0ea5e9' 
                    });
                    setShowServicioModal(true);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase flex items-center gap-1 cursor-pointer transition shadow-sm ${
                    pestanaActiva === 'internos'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border border-emerald-600/30 shadow-emerald-500/20'
                      : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white border border-sky-600/30 shadow-sky-500/20'
                  }`}
                >
                  <Plus className="w-3 h-3 text-white" /> Servicio
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setServicioEditando(null);
                    setFormServicio({ 
                      nombre: '', 
                      descripcion: '', 
                      precio: '', 
                      duracion: pestanaActiva === 'internos' ? 'interno' : '60 min', 
                      categoria: 'paquete', 
                      color: pestanaActiva === 'internos' ? '#059669' : '#3b82f6' 
                    });
                    setShowServicioModal(true);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase flex items-center gap-1 cursor-pointer transition"
                >
                  <Plus className="w-3 h-3 text-slate-600" /> Paquete
                </button>
              </div>
            </div>

            <div className="flex border-b border-slate-200 gap-4">
              <button
                type="button"
                onClick={() => setPestanaActiva('externos')}
                className={`pb-2 text-[10px] font-bold uppercase border-b-2 cursor-pointer transition-colors ${
                  pestanaActiva === 'externos' 
                    ? 'border-sky-500 text-sky-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Servicios Externos
              </button>
              <button
                type="button"
                onClick={() => setPestanaActiva('internos')}
                className={`pb-2 text-[10px] font-bold uppercase border-b-2 cursor-pointer transition-colors ${
                  pestanaActiva === 'internos' 
                    ? 'border-emerald-500 text-emerald-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Servicios Internos
              </button>
            </div>

            <div className="space-y-2">
              {serviciosFirebase.filter(serv => pestanaActiva === 'internos' ? serv.duracion === 'interno' : serv.duracion !== 'interno').length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center text-slate-500 text-[10px]">
                  {pestanaActiva === 'internos' 
                    ? 'No tienes servicios internos creados.' 
                    : 'No tienes servicios externos creados.'}
                </div>
              ) : (
                serviciosFirebase
                  .filter(serv => pestanaActiva === 'internos' ? serv.duracion === 'interno' : serv.duracion !== 'interno')
                  .map(serv => {
                    const esPaquete = serv.categoria === 'paquete';
                    const esInterno = pestanaActiva === 'internos';
                    const colorServicio = serv.color || (esPaquete ? (esInterno ? '#059669' : '#3b82f6') : (esInterno ? '#10b981' : '#0ea5e9'));

                    return (
                      <div key={serv.id} className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl flex justify-between items-start shadow-xs gap-3 relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${esInterno ? 'bg-gradient-to-b from-emerald-400 to-teal-600' : 'bg-gradient-to-b from-sky-400 to-blue-600'}`} />
                        
                        <div className="flex items-start gap-2.5 pl-1">
                          <div 
                            className="w-3 h-3 rounded-full mt-1 shrink-0 border border-slate-300 shadow-xs" 
                            style={{ backgroundColor: colorServicio }} 
                            title={`Color: ${colorServicio}`}
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[8px] px-2 py-0.5 rounded-lg font-bold uppercase border ${
                                esInterno 
                                  ? (esPaquete ? 'bg-teal-50 border-teal-200 text-teal-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600')
                                  : (esPaquete ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-sky-50 border-sky-200 text-sky-600')
                              }`}>
                                {esPaquete ? 'Paquete' : 'Servicio'}
                              </span>
                              <p className="text-[11px] font-bold text-slate-800">{serv.nombre}</p>
                              {pestanaActiva !== 'internos' && (
                                <span className="text-[8px] bg-slate-200/70 border border-slate-300 text-slate-600 px-2 py-0.5 rounded-lg font-bold">Duración: {serv.duracion}</span>
                              )}
                            </div>
                            <p className="text-[9px] text-slate-500 leading-snug">{serv.descripcion || 'Sin descripción detallada.'}</p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1 shrink-0">
                          <p className={`text-[11px] font-bold bg-gradient-to-r bg-clip-text text-transparent ${esInterno ? 'from-emerald-600 to-teal-600' : 'from-sky-600 to-blue-600'}`}>{serv.precio}</p>
                          <div className="flex items-center gap-1">
                            <button 
                              type="button"
                              onClick={() => {
                                setServicioEditando(serv);
                                setFormServicio({ 
                                  nombre: serv.nombre, 
                                  descripcion: serv.descripcion || '', 
                                  precio: serv.precio, 
                                  duracion: pestanaActiva === 'internos' ? 'interno' : (serv.duracion || '45 min'),
                                  categoria: serv.categoria || 'servicio',
                                  color: serv.color || (serv.categoria === 'paquete' ? (esInterno ? '#059669' : '#3b82f6') : (esInterno ? '#10b981' : '#0ea5e9'))
                                });
                                setShowServicioModal(true);
                              }}
                              className={`p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 cursor-pointer transition-colors shadow-xs ${
                                esInterno ? 'hover:bg-emerald-50 hover:text-emerald-600' : 'hover:bg-sky-50 hover:text-sky-600'
                              }`}
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => eliminarServicioFirestore(serv.id)}
                              className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 cursor-pointer transition-colors shadow-xs"
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
              <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full inline-block ${pestanaActiva === 'internos' ? 'bg-emerald-500' : 'bg-sky-500'}`}></span>
                      {servicioEditando ? '✏️ EDITAR SERVICIO / PAQUETE' : '✨ NUEVO SERVICIO O PAQUETE'}
                    </h3>
                    <button 
                      type="button"
                      onClick={() => setShowServicioModal(false)} 
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 cursor-pointer transition"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={(e) => {
                    if (pestanaActiva === 'internos') {
                      e.preventDefault();
                    }
                    handleGuardarServicio(e);
                  }} className="space-y-3 text-[10px]">
                    
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 uppercase text-[9px]">Tipo</label>
                      <select 
                        value={formServicio.categoria} 
                        onChange={e => setFormServicio({...formServicio, categoria: e.target.value})}
                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 outline-none font-medium uppercase ${
                          pestanaActiva === 'internos' ? 'focus:border-emerald-500' : 'focus:border-sky-500'
                        }`}
                      >
                        <option value="servicio">SERVICIO</option>
                        <option value="paquete">PAQUETE</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 uppercase text-[9px]">Nombre del Servicio / Paquete *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="EJ: CORTE FADE + BARBA VIP" 
                        value={formServicio.nombre} 
                        onChange={e => setFormServicio({...formServicio, nombre: e.target.value.toUpperCase()})}
                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[11px] text-slate-800 outline-none uppercase ${
                          pestanaActiva === 'internos' ? 'focus:border-emerald-500' : 'focus:border-sky-500'
                        }`} 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 uppercase text-[9px]">Descripción</label>
                      <textarea 
                        rows="2" 
                        placeholder="DETALLES DE LO QUE INCLUYE..." 
                        value={formServicio.descripcion} 
                        onChange={e => setFormServicio({...formServicio, descripcion: e.target.value.toUpperCase()})}
                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[11px] text-slate-800 outline-none resize-none uppercase ${
                          pestanaActiva === 'internos' ? 'focus:border-emerald-500' : 'focus:border-sky-500'
                        }`} 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-500 uppercase text-[9px]">Color del Servicio</label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                          <input 
                            type="color" 
                            value={formServicio.color || (pestanaActiva === 'internos' ? '#10b981' : '#0ea5e9')} 
                            onChange={e => setFormServicio({...formServicio, color: e.target.value})}
                            className="w-7 h-6 rounded border-0 bg-transparent cursor-pointer outline-none"
                          />
                          <span className="ml-2 text-xs font-mono uppercase text-slate-600">
                            {formServicio.color || (pestanaActiva === 'internos' ? '#10b981' : '#0ea5e9')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                        {(pestanaActiva === 'internos' 
                          ? ['#10b981', '#34d399', '#059669', '#0d9488', '#14b8a6', '#22c55e', '#84cc16', '#6366f1', '#ec4899', '#64748b']
                          : ['#0ea5e9', '#38bdf8', '#3b82f6', '#6366f1', '#06b6d4', '#10b981', '#8b5cf6', '#ec4899', '#f43f5e', '#64748b']
                        ).map((colorHex) => (
                          <button
                            key={colorHex}
                            type="button"
                            onClick={() => setFormServicio({ ...formServicio, color: colorHex })}
                            className="w-5 h-5 rounded-full border border-slate-300 hover:scale-110 transition-transform cursor-pointer shadow-xs"
                            style={{ backgroundColor: colorHex }}
                            title={colorHex}
                          />
                        ))}
                      </div>
                    </div>

                    <div className={pestanaActiva === 'internos' ? "space-y-1" : "grid grid-cols-2 gap-2"}>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase text-[9px]">Precio *</label>
                        <input 
                          type="text" 
                          required
                          placeholder="EJ: $45.000" 
                          value={formServicio.precio} 
                          onChange={e => setFormServicio({...formServicio, precio: e.target.value})}
                          className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[11px] text-slate-800 outline-none ${
                            pestanaActiva === 'internos' ? 'focus:border-emerald-500' : 'focus:border-sky-500'
                          }`} 
                        />
                      </div>
                      {pestanaActiva !== 'internos' && (
                        <div className="space-y-1">
                          <label className="font-bold text-slate-500 uppercase text-[9px]">Duración</label>
                          <input 
                            type="text" 
                            placeholder="EJ: 45 MIN" 
                            value={formServicio.duracion} 
                            onChange={e => setFormServicio({...formServicio, duracion: e.target.value.toUpperCase()})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[11px] text-slate-800 outline-none focus:border-sky-500 uppercase" 
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-slate-100">
                      <button 
                        type="button" 
                        onClick={() => setShowServicioModal(false)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-[10px] transition-colors cursor-pointer border border-slate-200 uppercase"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        onClick={() => {
                          if (pestanaActiva === 'internos') {
                            setFormServicio(prev => ({ ...prev, duracion: 'interno' }));
                          }
                        }}
                        className={`flex-1 font-black py-2 rounded-xl text-[10px] uppercase transition-all cursor-pointer shadow-md ${
                          pestanaActiva === 'internos'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/20'
                            : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-sky-500/20'
                        }`}
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

        {activeTab === 'comunidad' && (
          <Comunidad />
        )}

        {activeTab === 'facturacion' && (
          <Wallet setPestanaActiva={setPestanaActiva} setActiveTab={setActiveTab}/>
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
                <div className="flex gap-2">
                  <button onClick={() => setModalHorarioSemanalAbierto(true)} className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 px-3 py-1.5 rounded-xl font-bold text-[10px] flex items-center gap-1.5 cursor-pointer transition">
                    🕒 Horarios
                  </button>
                  <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl font-bold text-[10px] flex items-center gap-1.5 cursor-pointer transition">
                    <Edit3 className="w-3 h-3" /> Editar
                  </button>
                </div>
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
                
                <div className="grid grid-cols-2 gap-2">
                  {renderFieldView("Especialidad", especialidad)}
                  {renderFieldView("Porcentaje (%)", porcentaje !== undefined && porcentaje !== null && porcentaje !== '' ? `${porcentaje}%` : '0%')}
                </div>

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

            {/* Modal para Editar Horarios Semanales */}
            {modalHorarioSemanalAbierto && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                <div className="w-full max-w-sm bg-white rounded-2xl p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-black text-slate-900 uppercase">🕒 Horario Semanal</h3>
                    <button onClick={() => setModalHorarioSemanalAbierto(false)} className="text-slate-400 font-bold cursor-pointer">✕</button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-[10px]">
                    {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map((diaKey) => {
                      const configDia = horarioSemanal[diaKey] || { abierto: true, apertura: '8:00 a. m.', cierre: '7:00 p. m.' };
                      return (
                        <div key={diaKey} className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200 gap-2">
                          <div className="flex items-center gap-2 shrink-0 w-24">
                            <input 
                              type="checkbox" 
                              checked={configDia.abierto} 
                              onChange={(e) => setHorarioSemanal({ ...horarioSemanal, [diaKey]: { ...configDia, abierto: e.target.checked } })}
                              className="rounded text-indigo-600 cursor-pointer"
                            />
                            <span className="capitalize font-bold text-slate-700">{diaKey}</span>
                          </div>

                          {configDia.abierto ? (
                            <div className="flex items-center gap-1 flex-1 justify-end">
                              <select 
                                value={configDia.apertura}
                                onChange={(e) => setHorarioSemanal({ ...horarioSemanal, [diaKey]: { ...configDia, apertura: e.target.value } })}
                                className="bg-white border border-slate-200 rounded-lg p-1 text-[9px] font-medium text-slate-800"
                              >
                                {horasCalendario.map((h, i) => <option key={i} value={h.label}>{h.label}</option>)}
                              </select>
                              <span className="text-slate-400">a</span>
                              <select 
                                value={configDia.cierre}
                                onChange={(e) => setHorarioSemanal({ ...horarioSemanal, [diaKey]: { ...configDia, cierre: e.target.value } })}
                                className="bg-white border border-slate-200 rounded-lg p-1 text-[9px] font-medium text-slate-800"
                              >
                                {horasCalendario.map((h, i) => <option key={i} value={h.label}>{h.label}</option>)}
                              </select>
                            </div>
                          ) : (
                            <span className="text-red-500 font-bold italic pr-2">Cerrado</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setModalHorarioSemanalAbierto(false)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-2 rounded-xl text-[10px]">Cancelar</button>
                    <button 
                      onClick={async () => {
                        try {
                          await updateDoc(doc(db, 'profesionales', authUser.uid), { horarioSemanal });
                          setSuccessMsg('¡Horario semanal actualizado correctamente!');
                          setModalHorarioSemanalAbierto(false);
                          setTimeout(() => setSuccessMsg(''), 3000);
                        } catch (err) {
                          setErrorMsg('Error al guardar el horario.');
                        }
                      }}
                      className="flex-1 bg-indigo-600 text-white font-bold py-2 rounded-xl text-[10px] uppercase shadow-xs"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                      nombre, 
                      descripcion, 
                      foto, 
                      telefono, 
                      correo: correoPerfil, 
                      zonasTrabajo, 
                      experiencia, 
                      ciudad, 
                      especialidad,
                      porcentaje: porcentaje !== '' ? Number(porcentaje) : 0
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
                        <label className="font-bold text-slate-500 uppercase text-[9px]">Correo Electrónico (No editable)</label>
                        <input 
                          type="email" 
                          value={correoPerfil} 
                          disabled 
                          className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-3 text-[12px] text-slate-500 cursor-not-allowed shadow-none outline-none select-none" 
                        />
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

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase text-[9px]">Especialidad</label>
                        <input type="text" value={especialidad} onChange={e => setEspecialidad(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[12px] text-slate-900 outline-none focus:border-indigo-600" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase text-[9px]">Porcentaje (%)</label>
                        <input type="number" value={porcentaje} onChange={e => setPorcentaje(e.target.value)} placeholder="0" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[12px] text-slate-900 outline-none focus:border-indigo-600" />
                      </div>
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

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-1 flex items-center justify-around z-40 shadow-lg">
        <button 
          onClick={() => setActiveTab('agenda')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${activeTab === 'agenda' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Calendar className="w-4 h-4 mb-1" />
          <span className="text-[9px] uppercase">Agenda</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('comunidad')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${activeTab === 'comunidad' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-[9px] uppercase">Comunidad</span>
        </button>

        <button 
          onClick={() => setActiveTab('servicios')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${activeTab === 'servicios' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Tag className="w-4 h-4 mb-1" />
          <span className="text-[9px] uppercase">Servicios</span>
        </button>

        <button 
          onClick={() => setActiveTab('facturacion')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${activeTab === 'facturacion' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <FileText className="w-4 h-4 mb-1" />
          <span className="text-[9px] uppercase">Finanzas</span>
        </button>

        <button 
          onClick={() => setActiveTab('perfil')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${activeTab === 'perfil' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Edit3 className="w-4 h-4 mb-1" />
          <span className="text-[9px] uppercase">Perfil</span>
        </button>

        <button 
          onClick={handleCerrarSesion}
          className="flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer text-red-600 hover:text-red-700"
        >
          <LogOut className="w-4 h-4 mb-1 text-red-600" />
          <span className="text-[9px] uppercase font-bold">Salir</span>
        </button>
      </nav>

      {citaSeleccionada && (() => {
        const estadoActual = (citaSeleccionada.estado || '').toLowerCase();
        const esFinalizada = estadoActual === 'finalizada' || estadoActual === 'finalizado';
        const esCancelada = estadoActual === 'cancelada' || estadoActual === 'cancelado';

        const calcularTotalDinamico = () => {
          let suma = 0;
          serviciosModalCita.forEach(s => {
            if (s.precioNum) {
              suma += Number(s.precioNum);
            } else if (s.precio) {
              const num = parseInt(s.precio.toString().replace(/[^0-9]/g, ''), 10);
              if (!isNaN(num)) suma += num;
            }
          });
          return suma > 0 ? `$${suma.toLocaleString('es-CO')} COP` : (citaSeleccionada.precioTotal || '$0');
        };

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 w-full max-w-md space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-900">
                    {citaSeleccionada.esBloqueo ? '🚫 Gestionar Horario No Disponible' : esFinalizada ? '📋 Detalle de Cita Finalizada' : esCancelada ? '❌ Detalle de Cita Cancelada' : 'Gestionar Cita / Servicio'}
                  </h3>
                  <p className="text-[9px] text-indigo-600 font-bold">{citaSeleccionada.esBloqueo ? citaSeleccionada.motivo : 'Actualización de servicios y agenda'}</p>
                </div>
                <button onClick={() => setCitaSeleccionada(null)} className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer">✕</button>
              </div>

              <div className="space-y-3 text-[10px]">
                {citaSeleccionada.esBloqueo ? (
                  <div className="space-y-2.5 pt-1">
                    <div>
                      <label className="font-bold text-slate-700 uppercase text-[9px] block mb-1">Motivo del Bloqueo:</label>
                      <input 
                        type="text" 
                        value={nuevoMotivoBloqueo} 
                        onChange={e => setNuevoMotivoBloqueo(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none focus:border-indigo-600 font-medium" 
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 uppercase text-[9px] block mb-1">Fecha del Bloqueo:</label>
                      <input 
                        type="date" 
                        value={nuevaFechaCita} 
                        onChange={e => setNuevaFechaCita(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none focus:border-indigo-600 font-medium" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-slate-700 uppercase text-[9px] block mb-1">Hora Inicio:</label>
                        <select 
                          value={nuevaHoraCita} 
                          onChange={e => setNuevaHoraCita(e.target.value)} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none focus:border-indigo-600 font-medium text-[10px]"
                        >
                          {horasCalendario.map((h, i) => (
                            <option key={i} value={h.label}>{h.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 uppercase text-[9px] block mb-1">Hora Fin:</label>
                        <select 
                          value={nuevaHoraFinCita} 
                          onChange={e => setNuevaHoraFinCita(e.target.value)} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none focus:border-indigo-600 font-medium text-[10px]"
                        >
                          {horasCalendario.map((h, i) => (
                            <option key={i} value={h.label}>{h.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
                      <p><strong className="text-slate-500">Cliente:</strong> <span className="text-slate-900 font-bold">{citaSeleccionada.clienteNombre || citaSeleccionada.cliente}</span></p>
                      {citaSeleccionada.clienteTelefono && <p><strong className="text-slate-500">Teléfono:</strong> <span className="text-slate-900">{citaSeleccionada.clienteTelefono}</span></p>}
                      <p><strong className="text-slate-500">Dirección:</strong> <span className="text-slate-900">{citaSeleccionada.direccion || 'No especificada'}</span></p>
                      <p><strong className="text-slate-500">Estado:</strong> <span className={`uppercase font-bold ${esCancelada ? 'text-rose-600' : esFinalizada ? 'text-slate-500' : 'text-emerald-600'}`}>{citaSeleccionada.estado}</span></p>
                    </div>

                    {!esFinalizada && !esCancelada && (
                      <div className="space-y-2.5 pt-1 border-t border-slate-100">
                        <label className="font-bold text-slate-700 uppercase text-[9px] block">Servicios Seleccionados:</label>
                        
                        <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-slate-50 border border-slate-200 rounded-xl">
                          {serviciosModalCita.length === 0 ? (
                            <span className="text-slate-400 italic">No hay servicios seleccionados.</span>
                          ) : (
                            serviciosModalCita.map((s, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-950 px-2 py-1 rounded-lg font-bold text-[9px] shadow-xs">
                                <span>{s.nombre || s.name}</span>
                                <span className="text-indigo-600 font-normal">({s.precio})</span>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setServiciosModalCita(prev => prev.filter((_, i) => i !== idx));
                                  }}
                                  className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                                >
                                  ✕
                                </button>
                              </span>
                            ))
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <select 
                            id="select-agregar-servicio"
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none focus:border-indigo-600 font-medium text-[10px]"
                          >
                            <option value="">-- Añadir otro servicio --</option>
                            {serviciosFirebase.map((serv) => (
                              <option key={serv.id} value={serv.id}>{serv.nombre} - {serv.precio}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              const selectEl = document.getElementById('select-agregar-servicio');
                              const servId = selectEl.value;
                              if (!servId) return;
                              const servEncontrado = serviciosFirebase.find(s => s.id === servId);
                              if (servEncontrado) {
                                setServiciosModalCita(prev => [...prev, {
                                  nombre: servEncontrado.nombre,
                                  precio: servEncontrado.precio,
                                  precioNum: servEncontrado.precioNum || parseInt((servEncontrado.precio || '').replace(/[^0-9]/g, ''), 10) || 0
                                }]);
                                selectEl.value = '';
                              }
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-2 rounded-xl text-[10px] uppercase cursor-pointer shadow-xs transition"
                          >
                            Añadir
                          </button>
                        </div>

                        <div className="flex justify-between items-center bg-indigo-50/60 border border-indigo-100 p-2.5 rounded-xl font-bold">
                          <span className="text-slate-600 uppercase text-[9px]">Total Actualizado:</span>
                          <span className="text-indigo-600 text-[11px]">{calcularTotalDinamico()}</span>
                        </div>
                      </div>
                    )}

                    {!esFinalizada && !esCancelada && (
                      <div className="space-y-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-bold text-slate-700 uppercase text-[9px] block mb-1">Reprogramar Fecha:</label>
                          <input 
                            type="date" 
                            value={nuevaFechaCita} 
                            onChange={e => setNuevaFechaCita(e.target.value)} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none focus:border-indigo-600 font-medium" 
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 uppercase text-[9px] block mb-1">Reprogramar Hora:</label>
                          <select 
                            value={nuevaHoraCita} 
                            onChange={e => setNuevaHoraCita(e.target.value)} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none focus:border-indigo-600 font-medium text-[10px]"
                          >
                            <option value={nuevaHoraCita}>{nuevaHoraCita} (Actual)</option>
                            {horasCalendario.map((h, i) => (
                              <option key={i} value={h.label}>{h.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 mt-2 border-t border-slate-100">
                {citaSeleccionada.esBloqueo ? (
                  <div className="flex gap-2 w-full">
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm('¿Estás seguro de eliminar este bloqueo?')) {
                          try {
                            await deleteDoc(doc(db, 'bloqueos', citaSeleccionada.id));
                            setSuccessMsg('Bloqueo eliminado correctamente');
                            setCitaSeleccionada(null);
                            setTimeout(() => setSuccessMsg(''), 3000);
                          } catch (err) {
                            console.error(err);
                            setErrorMsg('Error al eliminar el bloqueo');
                            setTimeout(() => setErrorMsg(''), 3000);
                          }
                        }
                      }}
                      className="flex-1 px-3 py-2 rounded-xl text-[10px] font-bold bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-300 transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center gap-1"
                    >
                      🗑️ Eliminar
                    </button>
                   <button 
  type="button"
  onClick={async (e) => {
    e.stopPropagation(); // Evita que el evento burbujee a otros elementos
    try {
      setLoading(true);

      const minInicio = horaAMinutos(nuevaHoraCita);
      const minFin = horaAMinutos(nuevaHoraFinCita);
      let duracionTotal = minFin - minInicio;
      if (duracionTotal <= 0) duracionTotal += 1440;

      const payloadBloqueo = {
        barberoId: authUser.uid,
        motivo: nuevoMotivoBloqueo || 'No disponible',
        fechaStr: nuevaFechaCita,
        fecha: nuevaFechaCita,
        horaInicio: nuevaHoraCita,
        hora: nuevaHoraCita,
        horaFin: nuevaHoraFinCita,
        duracionTotal,
        esBloqueo: true,
        creadoEn: new Date().toISOString()
      };

      if (citaSeleccionada?.id) {
        // EDITAR bloqueo existente
        await updateDoc(doc(db, "bloqueos", citaSeleccionada.id), payloadBloqueo);
        setSuccessMsg('¡Bloqueo actualizado con éxito!');
      } else {
        // CREAR un NUEVO bloqueo en rango de fechas
        const fechaInicioObj = new Date(nuevaFechaCita + 'T00:00:00');
        const fechaFinObj = new Date((nuevaFechaFinCita || nuevaFechaCita) + 'T00:00:00');

        if (fechaFinObj < fechaInicioObj) {
          setErrorMsg('La fecha de fin no puede ser anterior a la fecha de inicio.');
          setLoading(false);
          return;
        }

        let fechaActualObj = new Date(fechaInicioObj);
        while (fechaActualObj <= fechaFinObj) {
          const fechaStrActual = fechaActualObj.toISOString().split('T')[0];
          
          const payloadRango = {
            ...payloadBloqueo,
            fechaStr: fechaStrActual,
            fecha: fechaStrActual
          };

          await addDoc(collection(db, "bloqueos"), payloadRango);
          fechaActualObj.setDate(fechaActualObj.getDate() + 1);
        }

        setSuccessMsg('¡Bloqueos guardados con éxito!');
      }

      // CERRAR EL MODAL Y ASEGURAR QUE CITA SELECCIONADA QUEDE EN NULL
      setModalBloqueoAbierto(false);
      setCitaSeleccionada(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error("Error al guardar el bloqueo:", error);
      setErrorMsg('Ocurrió un error al guardar el bloqueo.');
    } finally {
      setLoading(false);
    }
  }}
  disabled={loading}
  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-[10px] uppercase shadow-xs flex items-center justify-center gap-1 cursor-pointer transition"
>
  {loading ? (
    <Loader2 className="w-3.5 h-3.5 animate-spin" />
  ) : (
    citaSeleccionada?.id ? '✓ GUARDAR CAMBIOS' : '✓ GUARDAR'
  )}
</button>
                  </div>
                ) : esFinalizada ? (
                  <button
                    type="button"
                    onClick={() => setCitaSeleccionada(null)}
                    className="w-full px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-slate-800 text-white hover:bg-slate-900 border border-slate-700 transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    Cerrar Detalle
                  </button>
                ) : esCancelada ? (
                  <div className="flex gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => setCitaSeleccionada(null)}
                      className="flex-1 px-3 py-2 rounded-xl text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer"
                    >
                      Cerrar
                    </button>
                    <button
                      type="button"
                      onClick={() => actualizarCitaFirestore('confirmada')}
                      disabled={modalLoading}
                      className="flex-1 px-3 py-2 rounded-xl text-[10px] font-black uppercase bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-800 transition-all cursor-pointer shadow-md flex items-center justify-center gap-1"
                    >
                      {modalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>✨ Activar Cita</>}
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => actualizarCitaFirestore('cancelada')}
                      disabled={modalLoading}
                      className="px-3 py-2 rounded-xl text-[10px] font-bold bg-rose-600 text-white hover:bg-rose-700 border border-rose-800 transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1"
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
                      onClick={async () => {
                        if (!citaSeleccionada) return;
                        setModalLoading(true);
                        try {
                          const citaRef = doc(db, 'citas', citaSeleccionada.id);
                          const nombresServicios = serviciosModalCita.map(s => s.nombre || s.name).join(', ');
                          
                          await updateDoc(citaRef, {
                            fecha: nuevaFechaCita,
                            hora: nuevaHoraCita,
                            servicios: serviciosModalCita,
                            servicio: nombresServicios || 'Servicio General',
                            precioTotal: calcularTotalDinamico()
                          });
                          
                          setSuccessMsg('Cita actualizada correctamente');
                          setCitaSeleccionada(null);
                          setTimeout(() => setSuccessMsg(''), 3000);
                        } catch (err) {
                          console.error(err);
                          setErrorMsg('Error al actualizar la cita');
                          setTimeout(() => setErrorMsg(''), 3000);
                        } finally {
                          setModalLoading(false);
                        }
                      }}
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