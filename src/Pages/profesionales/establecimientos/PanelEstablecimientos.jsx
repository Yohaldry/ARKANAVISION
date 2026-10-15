import React, { useState, useEffect, useRef} from 'react';
import { 
  Calendar, Users, Sparkles, CheckCircle2, Clock, 
  AlertCircle, ShieldCheck, Filter, RefreshCw, LogOut, Check, Search, TrendingUp, Scissors, UserPlus, X, Link as LinkIcon, Unlink, LayoutDashboard, Settings, DollarSign, Globe, Copy, ExternalLink, Package
} from 'lucide-react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, where, doc, getDoc, updateDoc, addDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../../../components/firebase';
import Servicios from './Servicios';
import InventarioEstablecimiento from './InventarioEstablecimiento';
import Producido from './Producido';
import GestionProfesionales from './GestionProfesionales';

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

export default function PanelEstablecimientos() {
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [establecimientoData, setEstablecimientoData] = useState(null);
  
  const [seccionActiva, setSeccionActiva] = useState('agenda');

  const [profesionales, setProfesionales] = useState([]);
  const [citas, setCitas] = useState([]);
  const [serviciosEstablecimiento, setServiciosEstablecimiento] = useState([]);
  const [bloqueos, setBloqueos] = useState([]);
  
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [busquedaProf, setBusquedaProf] = useState('');
  const [hoverCell, setHoverCell] = useState(null);
  
  const [modalBarberosOpen, setModalBarberosOpen] = useState(false);
  const [correoBusqueda, setCorreoBusqueda] = useState('');
  const [resultadoBusqueda, setResultadoBusqueda] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [msgBusqueda, setMsgBusqueda] = useState('');

  const [profesionalADesvincular, setProfesionalADesvincular] = useState(null);
  const [serviciosSeleccionadosIds, setServiciosSeleccionadosIds] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiadoLink, setCopiadoLink] = useState(false);
  const [modalCitaOpen, setModalCitaOpen] = useState(false);
  const [citaSeleccionData, setCitaSeleccionData] = useState({ prof: null, hora: '' });
  const [servicioSeleccionadoId, setServicioSeleccionadoId] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  const [guardandoCita, setGuardandoCita] = useState(false);
  const [horaInicioBloqueo, setHoraInicioBloqueo] = useState('');
  const [horaFinBloqueo, setHoraFinBloqueo] = useState('');
  const [bloqueoEnEdicion, setBloqueoEnEdicion] = useState(null);
  const [modalHorarioOpen, setModalHorarioOpen] = useState(false);
  const [guardandoHorario, setGuardandoHorario] = useState(false);
const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [tipoAccionModal, setTipoAccionModal] = useState('cita'); 
  const [motivoBloqueo, setMotivoBloqueo] = useState('');
const [dropdownServiciosOpen, setDropdownServiciosOpen] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [estadoTemporal, setEstadoTemporal] = useState('');
  const [mostrarConfirmacionEstado, setMostrarConfirmacionEstado] = useState(false);
  const [nuevoEstadoSeleccionado, setNuevoEstadoSeleccionado] = useState('');

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

  const obtenerColorEstado = (estado) => {
    const est = (estado || '').toLowerCase().trim();
    if (est === 'cancelada' || est === 'cancelado' || est === 'inasistente') {
      return 'bg-gradient-to-r from-rose-600 to-red-600 text-white border-rose-700';
    }
    if (est === 'finalizada' || est === 'finalizado' || est === 'confirmada' || est === 'confirmado') {
      return 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-700';
    }
    return 'bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 text-white border-blue-700';
  };

  const handleGuardarBloqueoRango = async (e) => {
    e.preventDefault();
    if (!citaSeleccionData.prof) return;

    setGuardandoCita(true);
    try {
      const minInicio = horaAMinutos(horaInicioBloqueo);
      const minFin = horaAMinutos(horaFinBloqueo);
      const duracionMinutos = Math.max(minFin - minInicio, 60);

      const objetoBloqueo = {
        establecimientoId: auth.currentUser?.uid,
        barberoId: citaSeleccionData.prof.id,
        barberoName: citaSeleccionData.prof.nombre,
        hora: horaInicioBloqueo,
        horaInicio: horaInicioBloqueo,
        horaFin: horaFinBloqueo,
        fechaStr: fechaStrActual,
        fecha: fechaStrActual,
        motivo: motivoBloqueo || 'No disponible',
        cliente: 'BLOQUEADO',
        servicio: 'Bloqueo de Horario',
        estado: 'bloqueado',
        duracion: duracionMinutos,
        createdAt: new Date().toISOString()
      };

      if (bloqueoEnEdicion) {
        await updateDoc(doc(db, 'bloqueos', bloqueoEnEdicion.id), objetoBloqueo);
        
        const qCitaEspejo = query(
          collection(db, 'citas'),
          where('barberoId', '==', citaSeleccionData.prof.id),
          where('fechaStr', '==', fechaStrActual),
          where('estado', '==', 'bloqueado')
        );
        const snapEspejo = await getDocs(qCitaEspejo);
        snapEspejo.forEach(async (docEspejo) => {
          const dataEspejo = docEspejo.data();
          if (dataEspejo.horaInicio === bloqueoEnEdicion.horaInicio || dataEspejo.hora === bloqueoEnEdicion.hora) {
            await updateDoc(doc(db, 'citas', docEspejo.id), objetoBloqueo);
          }
        });

        setSuccessMsg('¡Bloqueo actualizado correctamente en ambas agendas!');
      } else {
        await addDoc(collection(db, 'bloqueos'), objetoBloqueo);
        await addDoc(collection(db, 'citas'), objetoBloqueo);
        setSuccessMsg('¡Bloqueo registrado y sincronizado con la agenda del profesional!');
      }

      setModalCitaOpen(false);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error("Error al guardar bloqueo:", err);
      setErrorMsg('No se pudo registrar el bloqueo.');
      setTimeout(() => setErrorMsg(''), 3500);
    } finally {
      setGuardandoCita(false);
    }
  };

  const handleEliminarBloqueo = async () => {
    if (!bloqueoEnEdicion) return;
    setGuardandoCita(true);
    try {
      await deleteDoc(doc(db, 'bloqueos', bloqueoEnEdicion.id));
      
      const qCitaEspejo = query(
        collection(db, 'citas'),
        where('barberoId', '==', bloqueoEnEdicion.barberoId),
        where('fechaStr', '==', fechaStrActual),
        where('estado', '==', 'bloqueado')
      );
      const snapEspejo = await getDocs(qCitaEspejo);
      snapEspejo.forEach(async (docEspejo) => {
        const dataEspejo = docEspejo.data();
        if (dataEspejo.horaInicio === bloqueoEnEdicion.horaInicio || dataEspejo.hora === bloqueoEnEdicion.hora) {
          await deleteDoc(doc(db, 'citas', docEspejo.id));
        }
      });

      setSuccessMsg('Bloqueo eliminado de ambas agendas correctamente.');
      setModalCitaOpen(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Error al eliminar bloqueo:", err);
      setErrorMsg('No se pudo eliminar el bloqueo.');
    } finally {
      setGuardandoCita(false);
    }
  };

  const diasSemanaDefecto = {
    lunes: { abierto: true, apertura: '8:00 a. m.', cierre: '8:00 p. m.' },
    martes: { abierto: true, apertura: '8:00 a. m.', cierre: '8:00 p. m.' },
    miercoles: { abierto: true, apertura: '8:00 a. m.', cierre: '8:00 p. m.' },
    jueves: { abierto: true, apertura: '8:00 a. m.', cierre: '8:00 p. m.' },
    viernes: { abierto: true, apertura: '8:00 a. m.', cierre: '8:00 p. m.' },
    sabado: { abierto: true, apertura: '8:00 a. m.', cierre: '8:00 p. m.' },
    domingo: { abierto: false, apertura: '8:00 a. m.', cierre: '8:00 p. m.' },
  };

  const [horarioSemanalTemp, setHorarioSemanalTemp] = useState(diasSemanaDefecto);

  const handleGuardarHorarioSemanal = async (e) => {
    e.preventDefault();
    if (!authUser) return;

    setGuardandoHorario(true);
    try {
  const docRef = doc(db, 'establecimientos', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (!docSnap.exists()) {
            window.location.href = '/loginestablecimientos';
            return;
          }

          const dataEst = docSnap.data();
          setAuthUser(user);
          setEstablecimientoData(dataEst);
          setServiciosEstablecimiento(dataEst.servicios || []); // <--- AQUÍ LEES LOS SERVICIOS DEL ARRAY
      setEstablecimientoData(prev => ({
        ...prev,
        horarioSemanal: horarioSemanalTemp
      }));

      setSuccessMsg('¡Horarios semanales actualizados correctamente!');
      setModalHorarioOpen(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Error al actualizar horarios:", err);
      setErrorMsg('No se pudo guardar el horario semanal.');
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setGuardandoHorario(false);
    }
  };

const handleAbrirModalCita = (prof, horaLabel, e, bloqueoEspecifico = null) => {
    if (bloqueoEspecifico) {
      setBloqueoEnEdicion(bloqueoEspecifico);
      setMotivoBloqueo(bloqueoEspecifico.motivo || '');
      setHoraInicioBloqueo(bloqueoEspecifico.horaInicio || bloqueoEspecifico.hora || horaLabel);
      setHoraFinBloqueo(bloqueoEspecifico.horaFin || horaLabel);
      setCitaSeleccionData({ prof, hora: horaLabel });
      setTipoAccionModal('editarBloqueo');
      setModalCitaOpen(true);
      setServiciosSeleccionadosIds([]);
      return;
    }

    let horaFormateada = horaLabel;

    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const cellHeight = rect.height;
      const porcentaje = Math.max(0, Math.min(1, clickY / cellHeight));
      const minutosCalculados = Math.round(porcentaje * 59);
      
      // Separamos la hora y conservamos el período (a. m. / p. m.) de forma intacta
      const partesHoraStr = horaLabel.split(' ');
      const timeStr = partesHoraStr[0];
      const period = partesHoraStr.slice(1).join(' ') || 'a. m.';
      let [h] = timeStr.split(':').map(Number);
      
      horaFormateada = `${h}:${minutosCalculados < 10 ? '0' + minutosCalculados : minutosCalculados} ${period}`;
    }

    const minFilaLabel = horaAMinutos(horaLabel);

    const bloqueoExistente = bloqueos.find(b => {
      const coincideBarbero = String(b.barberoId) === String(prof.id) || 
        (b.barberoName && prof.nombre && b.barberoName.toLowerCase().trim() === prof.nombre.toLowerCase().trim());
      if (!coincideBarbero || b.fechaStr !== fechaStrActual) return false;

      const minBloqInicio = horaAMinutos(b.horaInicio || b.hora);
      const minBloqFin = b.horaFin ? horaAMinutos(b.horaFin) : minBloqInicio + 60;

      return minFilaLabel >= minBloqInicio && minFilaLabel < minBloqFin;
    });

    if (bloqueoExistente) {
      setBloqueoEnEdicion(bloqueoExistente);
      setMotivoBloqueo(bloqueoExistente.motivo || '');
      setHoraInicioBloqueo(bloqueoExistente.horaInicio || bloqueoExistente.hora || horaLabel);
      setHoraFinBloqueo(bloqueoExistente.horaFin || horaLabel);
      setCitaSeleccionData({ prof, hora: horaFormateada });
      setTipoAccionModal('editarBloqueo');
    } else {
      setCitaSeleccionData({ prof, hora: horaFormateada });
      setServicioSeleccionadoId(serviciosEstablecimiento[0]?.id || serviciosEstablecimiento[0]?.nombre || '');
      setTelefonoCliente('');
      setMotivoBloqueo('Horario no disponible');
      setHoraInicioBloqueo(horaLabel);
      setHoraFinBloqueo(horaLabel);
      setBloqueoEnEdicion(null);
      setTipoAccionModal('selector');
    }
    setModalCitaOpen(true);
  };

  const handleGuardarCitaRapida = async (e) => {
    e.preventDefault();
    if (!citaSeleccionData.prof || !citaSeleccionData.hora) return;

    setGuardandoCita(true);
    try {
      const servicioObj = serviciosEstablecimiento.find(s => String(s.id) === String(servicioSeleccionadoId) || s.nombre === servicioSeleccionadoId) || { nombre: servicioSeleccionadoId || 'Servicio General', precio: 0, duracion: 30 };
      
      const telefonoLimpio = telefonoCliente.trim();
      const nombreClienteFinal = telefonoLimpio ? `Cliente (${telefonoLimpio})` : 'Sin cita';

      const nuevaCita = {
        id: 'cita_' + Date.now(),
        establecimientoId: auth.currentUser?.uid,
        barberoId: citaSeleccionData.prof.id,
        barberoName: citaSeleccionData.prof.nombre,
        cliente: nombreClienteFinal,
        telefono: telefonoLimpio || '',
        servicio: servicioObj.nombre,
        precio: Number(servicioObj.precio) || 0,
        precioTotal: Number(servicioObj.precio) || 0,
        duracion: Number(servicioObj.duracion) || 30,
        hora: citaSeleccionData.hora,
        fechaStr: fechaStrActual,
        fecha: fechaStrActual,
        estado: 'Pendiente',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'citas'), nuevaCita);

      setSuccessMsg('¡Cita registrada correctamente en la agenda!');
      setModalCitaOpen(false);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error("Error al guardar cita rápida:", err);
      setErrorMsg('No se pudo registrar la cita. Inténtalo de nuevo.');
      setTimeout(() => setErrorMsg(''), 3500);
    } finally {
      setGuardandoCita(false);
    }
  };

  const [zoomLevel, setZoomLevel] = useState(1);
  const agendaContainerRef = useRef(null);

  useEffect(() => {
    let unsubVinculados = () => {};
    let unsubCitas = () => {};
    let unsubServicios = () => {};
    let unsubBloqueos = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // VALIDACIÓN DE SEGURIDAD: Comprobamos si el usuario actual existe en la colección 'establecimientos'
          const docRef = doc(db, 'establecimientos', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (!docSnap.exists()) {
            // Si no es dueño de establecimiento, expulsamos o redirigimos (por ejemplo al login o dashboard profesional)
            window.location.href = '/loginestablecimientos';
            return;
          }

          setAuthUser(user);
          setEstablecimientoData(docSnap.data());

          const qVinculados = query(collection(db, 'profesionales'), where('establecimientoId', '==', user.uid));
          unsubVinculados = onSnapshot(qVinculados, (snapshot) => {
            const lista = [];
            snapshot.forEach(docSnap => {
              const data = docSnap.data();
              if (data.estadoVinculacion !== 'rechazado') {
                lista.push({ id: docSnap.id, ...data });
              }
            });
            setProfesionales(lista);
          });

          unsubCitas = onSnapshot(collection(db, 'citas'), (snapshot) => {
            const listaCitas = [];
            snapshot.forEach(docSnap => {
              const data = docSnap.data();
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
                horaBD.toLowerCase().includes(h.val24)
              );

              const horaNormalizada = matchHora ? matchHora.label : (horaBD || '12:00 a. m.');
              const estado = (data.estado || 'pendiente').toLowerCase();

              listaCitas.push({
                ...data,
                id: docSnap.id,
                cliente: data.clienteNombre || data.cliente || 'BLOQUEADO',
                servicio: data.servicio || 'Servicio General',
                hora: horaNormalizada,
                fechaStr: data.fecha || data.fechaStr || '',
                estado,
                esBloqueo: estado === 'bloqueado',
                motivo: data.motivo || ''
              });
            });
            setCitas(listaCitas);
          });

          const qServicios = query(collection(db, 'servicios'), where('establecimientoId', '==', user.uid));
         // Escuchar cambios en tiempo real del establecimiento (incluyendo sus servicios)
          unsubServicios = onSnapshot(docRef, (docDoc) => {
            if (docDoc.exists()) {
              const data = docDoc.data();
              setEstablecimientoData(data);
              setServiciosEstablecimiento(data.servicios || []);
            }
          });

          unsubBloqueos = onSnapshot(collection(db, 'bloqueos'), (snapshot) => {
            const listaBloqueos = [];
            snapshot.forEach(docSnap => {
              const data = docSnap.data();
              if (!data.establecimientoId || data.establecimientoId === user.uid) {
                listaBloqueos.push({
                  ...data,
                  id: docSnap.id,
                  cliente: 'BLOQUEADO',
                  servicio: 'Bloqueo de Horario',
                  estado: 'bloqueado',
                  esBloqueo: true
                });
              }
            });
            setBloqueos(listaBloqueos);
          });

        } catch (err) {
          console.error("Error al cargar datos del establecimiento:", err);
        }
      } else {
        setAuthUser(null);
        window.location.href = '/loginestablecimientos';
      }
      setAuthLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubVinculados();
      unsubCitas();
      unsubServicios();
      unsubBloqueos();
    };
  }, []);

  const buscarProfesionalPorCorreo = async (e) => {
    e.preventDefault();
    if (!correoBusqueda.trim()) return;

    setBuscando(true);
    setMsgBusqueda('');
    setResultadoBusqueda(null);

    try {
      const q = query(collection(db, 'profesionales'), where('email', '==', correoBusqueda.trim().toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setMsgBusqueda('No se encontró ningún profesional registrado con ese correo.');
      } else {
        querySnapshot.forEach((docSnap) => {
          setResultadoBusqueda({ id: docSnap.id, ...docSnap.data() });
        });
      }
    } catch (err) {
      console.error("Error buscando profesional:", err);
      setMsgBusqueda('Ocurrió un error al buscar el profesional.');
    } finally {
      setBuscando(false);
    }
  };

  const vincularBarbero = async (profId) => {
    try {
      setErrorMsg('');
      const profRef = doc(db, 'profesionales', profId);
      await updateDoc(profRef, {
        establecimientoId: authUser.uid,
        establecimientoNombre: establecimientoData?.nombre || 'Establecimiento',
        estadoVinculacion: 'pendiente'
      });
      setSuccessMsg('¡Solicitud enviada! Pendiente de aprobación del profesional.');
      setModalBarberosOpen(false);
      setResultadoBusqueda(null);
      setCorreoBusqueda('');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error("Error al vincular barbero:", err);
      setErrorMsg('No se pudo enviar la solicitud.');
    }
  };

  const desvincularBarbero = async (profId) => {
    try {
      setErrorMsg('');
      const profRef = doc(db, 'profesionales', profId);
      await updateDoc(profRef, {
        establecimientoId: '',
        establecimientoNombre: '',
        estadoVinculacion: ''
      });
      setSuccessMsg('Profesional desvinculado correctamente.');
      setProfesionalADesvincular(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Error al desvincular profesional:", err);
      setErrorMsg('No se pudo desvincular al profesional.');
    }
  };

  const handleCerrarSesion = async () => {
    try {
      await signOut(auth);
      window.location.href = '/loginestablecimientos';
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (authLoading) {
    return (
      <div className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center font-mono select-none">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-blue-200 shadow-md flex items-center justify-center p-2 mb-3 animate-pulse">
          <img 
            src="https://res.cloudinary.com/dtkirmtfq/image/upload/v1791241981/Visarka/mxmsobksbvrii384mlja.png" 
            alt="VISARKA" 
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-slate-900 text-[11px] font-black uppercase tracking-widest">VISARKA</h1>
        <p className="text-blue-600 text-[9px] font-mono tracking-wider mt-1">Cargando Panel Ejecutivo...</p>
      </div>
    );
  }

  const fechaStrActual = fechaSeleccionada.toISOString().split('T')[0];
  const profesionalesFiltrados = profesionales.filter(p => 
    (p.nombre || '').toLowerCase().includes(busquedaProf.toLowerCase()) ||
    (p.especialidad || '').toLowerCase().includes(busquedaProf.toLowerCase())
  );

  const totalCitasHoy = citas.filter(c => c.fechaStr === fechaStrActual && c.estado !== 'cancelada' && c.estado !== 'bloqueado').length;
  const linkAgendaPublica = `${window.location.origin}/agendaestablecimiento?id=${authUser?.uid || ''}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-mono flex selection:bg-blue-600 selection:text-white text-xs">
      
      {/* MENÚ LATERAL IZQUIERDO */}
      <aside className="group fixed left-0 top-0 h-screen w-16 hover:w-56 bg-white/95 border-r border-blue-200 backdrop-blur-md flex flex-col justify-between py-5 z-50 transition-all duration-300 shadow-[4px_0_20px_rgba(37,99,235,0.06)] overflow-hidden">
        
        <div className="px-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-white border border-blue-200 flex items-center justify-center shadow-xs p-1 shrink-0">
            <img 
              src="https://res.cloudinary.com/dtkirmtfq/image/upload/v1791241981/Visarka/mxmsobksbvrii384mlja.png" 
              alt="Logo VISARKA" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
            <h1 className="text-xs font-black uppercase tracking-wider text-slate-900">Visarka</h1>
            <p className="text-[8px] text-blue-600 font-bold">Establecimiento</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1.5 mt-8">
          <button 
            onClick={() => setSeccionActiva('agenda')}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${
              seccionActiva === 'agenda' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <Calendar className="w-5 h-5 shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold text-xs uppercase tracking-wider whitespace-nowrap">
              Agenda Matriz
            </span>
          </button>

          <button 
            onClick={() => setSeccionActiva('servicios')}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${
              seccionActiva === 'servicios' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <Scissors className="w-5 h-5 shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold text-xs uppercase tracking-wider whitespace-nowrap">
              Servicios
            </span>
          </button>
          
          <button 
            onClick={() => setSeccionActiva('profesionales')}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${
              seccionActiva === 'profesionales' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <Users className="w-5 h-5 shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold text-xs uppercase tracking-wider whitespace-nowrap">
              Profesionales
            </span>
          </button>
          
          <button 
            onClick={() => setSeccionActiva('producido')}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${
              seccionActiva === 'producido' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <DollarSign className="w-5 h-5 shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold text-xs uppercase tracking-wider whitespace-nowrap">
              Producido
            </span>
          </button>

          <button 
            onClick={() => setSeccionActiva('inventario')}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${
              seccionActiva === 'inventario' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <Package className="w-5 h-5 shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold text-xs uppercase tracking-wider whitespace-nowrap">
              Inventario
            </span>
          </button>
        </nav>

        <div className="px-3">
          <button 
            onClick={handleCerrarSesion}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200"
            title="Cerrar Sesión"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-black text-xs uppercase tracking-wider whitespace-nowrap">
              Salir
            </span>
          </button>
        </div>

      </aside>

      {/* CONTENEDOR GENERAL */}
      <div className="flex-1 ml-16 flex flex-col justify-between min-h-screen">
        
        <header className="w-full bg-white/95 border-b border-blue-200 px-6 py-2.5 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md shadow-xs">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
              {establecimientoData?.nombre || 'Panel de Establecimiento'}
            </h2>
            <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">
              ● En Vivo
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (establecimientoData?.horarioSemanal) {
                  setHorarioSemanalTemp(establecimientoData.horarioSemanal);
                }
                setModalHorarioOpen(true);
              }}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
              title="Configurar Horarios por Día"
            >
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Horarios Semanales</span>
            </button>

            <button
              onClick={() => setModalBarberosOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Vincular Profesional</span>
            </button>

            <div className="hidden lg:flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[10px] text-slate-600 font-bold">Link Clientes:</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(linkAgendaPublica);
                  setCopiadoLink(true);
                  setTimeout(() => setCopiadoLink(false), 2500);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                {copiadoLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiadoLink ? '¡Copiado!' : 'Copiar Link'}
              </button>
              <a
                href={`/agendaestablecimiento?id=${authUser?.uid || ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-slate-100 text-blue-600 p-1 rounded-lg border border-blue-200 transition-all cursor-pointer flex items-center justify-center"
                title="Abrir vista previa"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="hidden md:flex items-center gap-1.5 bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-lg text-[10px]">
              <span className="text-slate-500 font-bold">Admin:</span>
              <span className="text-blue-950 font-bold">{authUser?.email}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-[1700px] mx-auto w-full space-y-4">
          
          {successMsg && <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] flex gap-1.5 items-center shadow-2xs"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{successMsg}</div>}
          {errorMsg && <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-[10px] flex gap-1.5 items-center shadow-2xs"><AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />{errorMsg}</div>}

          {seccionActiva === 'agenda' && (() => {
            const totalProfs = profesionalesFiltrados.length;
            const colWidth = totalProfs === 1 
              ? '320px' 
              : totalProfs <= 3 && zoomLevel === 1 
                ? `calc((100% - 52px) / ${Math.max(totalProfs, 1)})` 
                : `${Math.max(130 * zoomLevel, 120)}px`;

            const gridStyleHeader = {
              display: 'grid',
              gridTemplateColumns: `52px repeat(${Math.max(totalProfs, 1)}, minmax(${colWidth}, 1fr))`
            };

            const rowHeightPx = Math.round(38 * zoomLevel);

            const mapDiasJS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
            const diaSemanaStr = mapDiasJS[fechaSeleccionada.getDay()];

            const horarioDiaActual = establecimientoData?.horarioSemanal?.[diaSemanaStr] || {
              abierto: true,
              apertura: '8:00 a. m.',
              cierre: '8:00 p. m.'
            };

            const minApertura = horaAMinutos(horarioDiaActual.apertura);
            const minCierre = horaAMinutos(horarioDiaActual.cierre);

            return (
              <div className="space-y-2 font-mono text-[10px] animate-in fade-in duration-200 relative">
                
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="bg-gradient-to-br from-blue-50 via-sky-50/50 to-white border border-blue-200/80 p-1.5 rounded-xl flex items-center justify-between shadow-2xs">
                    <div className="space-y-0 min-w-0">
                      <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider truncate">Plantilla</p>
                      <p className="text-sm font-black text-blue-950 truncate">{profesionales.length}</p>
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <Users className="w-3 h-3" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 via-sky-50/50 to-white border border-blue-200/80 p-1.5 rounded-xl flex items-center justify-between shadow-2xs">
                    <div className="space-y-0 min-w-0">
                      <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider truncate">Citas Hoy</p>
                      <p className="text-sm font-black text-blue-950 truncate">{totalCitasHoy}</p>
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <Calendar className="w-3 h-3" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 via-sky-50/50 to-white border border-blue-200/80 p-1.5 rounded-xl flex items-center justify-between shadow-2xs">
                    <div className="space-y-0 min-w-0">
                      <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider truncate">Servicios</p>
                      <p className="text-sm font-black text-blue-950 truncate">{serviciosEstablecimiento.length}</p>
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <Scissors className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-blue-200/80 rounded-xl p-2 shadow-2xs flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
                    <div className="relative w-full">
                      <Search className="w-3 h-3 text-blue-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        placeholder="Buscar profesional..."
                        value={busquedaProf}
                        onChange={(e) => setBusquedaProf(e.target.value)}
                        className="w-full bg-blue-50/50 border border-blue-200 rounded-lg pl-7 pr-2 py-1 text-[10px] text-slate-800 outline-none focus:border-blue-600 transition-all placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">
                      🔍 {Math.round(zoomLevel * 100)}% (Ctrl + Scroll)
                    </span>

                    <div className="flex items-center gap-1 bg-blue-50/80 border border-blue-200 px-2 py-1 rounded-lg">
                      <span className="text-[9px] font-bold text-blue-900 uppercase">📅</span>
                      <input 
                        type="date" 
                        value={fechaStrActual} 
                        onChange={(e) => {
                          if (e.target.value) setFechaSeleccionada(new Date(e.target.value + 'T00:00:00'));
                        }}
                        className="bg-transparent text-[10px] font-bold text-blue-600 outline-none cursor-pointer"
                      />
                    </div>

                    <button 
                      onClick={() => setFechaSeleccionada(new Date())}
                      className="bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase transition-all shadow-2xs cursor-pointer active:scale-95"
                    >
                      Hoy
                    </button>
                  </div>
                </div>

                <div className="relative w-full flex flex-col select-none rounded-xl border border-blue-200 bg-white shadow-2xs overflow-hidden">
                  {totalProfs === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-[10px] space-y-1">
                      <Users className="w-8 h-8 mx-auto opacity-30 text-blue-500" />
                      <p className="font-bold text-slate-600">No hay profesionales vinculados actualmente.</p>
                    </div>
                  ) : (
                    <div 
                      ref={agendaContainerRef}
                      className="relative w-full flex flex-col flex-1 overflow-y-auto overflow-x-auto max-h-[80vh]"
                    >
                      <div className="sticky top-0 z-40 bg-blue-50/95 backdrop-blur-md shadow-2xs border-b border-blue-300"
                           style={gridStyleHeader}>
                        <div className="p-1 text-blue-700 font-black text-[8px] border-r border-blue-200 bg-blue-100 flex items-center justify-center sticky left-0 z-50 uppercase">
                          Hora
                        </div>
                        {profesionalesFiltrados.map((prof) => {
                          const esPendiente = prof.estadoVinculacion === 'pendiente';
                          return (
                            <div key={prof.id} className={`p-1 border-r border-blue-200/70 last:border-r-0 flex items-center gap-1.5 min-w-0 ${esPendiente ? 'bg-amber-50/90' : 'bg-blue-50/95'}`}>
                              <button 
                                onClick={() => setProfesionalADesvincular(prof)}
                                className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-[9px] overflow-hidden shrink-0 shadow-2xs hover:scale-110 transition-all cursor-pointer relative group"
                                title="Clic para gestionar"
                              >
                                {prof.foto ? (
                                  <img src={prof.foto} alt={prof.nombre} className="w-full h-full object-cover" />
                                ) : (
                                  (prof.nombre || 'P').charAt(0).toUpperCase()
                                )}
                                <span className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] font-bold">
                                  ✕
                                </span>
                              </button>
                              
                              <div className="truncate min-w-0">
                                <p className="font-black text-slate-900 text-[10px] truncate leading-tight">{prof.nombre}</p>
                                <span className={`text-[7.5px] font-bold truncate block ${esPendiente ? 'text-amber-700' : 'text-blue-600'}`}>
                                  {esPendiente ? '⏳ Pendiente' : (prof.especialidad || 'Barbero')}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="relative flex-1">
                        {horasCalendario.map((itemHora, idx) => {
                          const [fH, fM] = itemHora.val24.split(':').map(Number);
                          const minutosFilaInicio = fH * 60 + fM;
                          const minutosFilaFin = minutosFilaInicio + 60;

                          const estaFueraDeHorario = !horarioDiaActual.abierto || minutosFilaInicio < minApertura || minutosFilaInicio >= minCierre;

                          return (
                            <div 
                              key={idx} 
                              className={`border-b border-blue-100 text-[9px] relative transition-all duration-75 ${
                                estaFueraDeHorario ? 'bg-slate-200/60 opacity-75' : ''
                              }`}
                              style={{ 
                                ...gridStyleHeader,
                                minHeight: `${rowHeightPx}px`
                              }}
                            >
                              
                              <div className={`border-r border-blue-200 px-1 font-mono text-[8px] font-bold flex items-center justify-center text-center sticky left-0 z-20 shadow-[2px_0_6px_-2px_rgba(37,99,235,0.1)] ${
                                estaFueraDeHorario ? 'bg-slate-300/90 text-slate-500 line-through' : 'bg-blue-50/95 text-blue-700'
                              }`}>
                                <span>{itemHora.label.toLowerCase()}</span>
                              </div>

                              {profesionalesFiltrados.map((prof, pIdx) => {
                                const esPendiente = prof.estadoVinculacion === 'pendiente';

                                if (esPendiente) {
                                  return (
                                    <div key={pIdx} className="border-r border-amber-200/40 last:border-r-0 p-0.5 bg-amber-50/30 flex items-center justify-center text-center">
                                      {idx === 0 && (
                                        <span className="text-[7.5px] font-extrabold text-amber-700 bg-amber-100/80 px-1 rounded border border-amber-300 truncate">
                                          Inhabilitado
                                        </span>
                                      )}
                                    </div>
                                  );
                                }

                               const citasInicianAqui = citas.filter(c => {
                                  const coincideBarbero = String(c.barberoId) === String(prof.id) || 
                                    (c.barberoName && prof.nombre && c.barberoName.toLowerCase().trim() === prof.nombre.toLowerCase().trim());
                                  if (!coincideBarbero || c.fechaStr !== fechaStrActual || !c.hora || c.estado === 'bloqueado') return false;
                                  const minCita = horaAMinutos(c.hora);
                                  return minCita >= minutosFilaInicio && minCita < minutosFilaFin;
                                });

                                const bloqueosInicianAqui = bloqueos.filter(b => {
                                  const coincideBarbero = String(b.barberoId) === String(prof.id) || 
                                    (b.barberoName && prof.nombre && b.barberoName.toLowerCase().trim() === prof.nombre.toLowerCase().trim());
                                  if (!coincideBarbero || b.fechaStr !== fechaStrActual) return false;

                                  const minBloqInicio = horaAMinutos(b.horaInicio || b.hora);
                                  return minBloqInicio >= minutosFilaInicio && minBloqInicio < minutosFilaFin;
                                });

                                const isHovered = hoverCell?.horaIdx === idx && hoverCell?.profIdx === pIdx;

                                return (
                                  <div 
                                    key={pIdx} 
                                    onClick={(e) => handleAbrirModalCita(prof, itemHora.label, e)}
                                    onMouseMove={(e) => {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      const y = e.clientY - rect.top;
                                      const cellHeight = rect.height;
                                      const porcentaje = Math.max(0, Math.min(1, y / cellHeight));
                                      const minutosCalculados = Math.round(porcentaje * 59);
                                      
                                      const [timeStr, period] = itemHora.label.split(' ');
                                      let [h] = timeStr.split(':').map(Number);

                                      const horaFormateada = `${h}:${minutosCalculados < 10 ? '0' + minutosCalculados : minutosCalculados} ${period || ''}`;
                                      setHoverCell({ horaIdx: idx, profIdx: pIdx, horaTexto: horaFormateada, topPos: y });
                                    }}
                                    onMouseLeave={() => setHoverCell(null)}
                                    className={`border-r border-blue-100/60 last:border-r-0 p-0.5 relative flex flex-col gap-0.5 items-stretch transition-colors cursor-pointer group ${
                                      estaFueraDeHorario ? 'bg-slate-300/30 hover:bg-slate-300/50' : 'hover:bg-sky-50/40'
                                    }`}
                                  >
                                    {isHovered && (
                                      <div 
                                        className="absolute left-0 right-0 pointer-events-none z-30 flex items-center transition-all duration-75"
                                        style={{ top: `${hoverCell.topPos}px` }}
                                      >
                                        <div className="w-full h-[2px] bg-gradient-to-r from-blue-500 via-sky-400 to-blue-600 shadow-[0_0_8px_rgba(56,189,248,0.8)] animate-pulse"></div>
                                        
                                        <span className="absolute right-1.5 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-sky-500 text-white text-[8px] px-1.5 py-0.5 rounded-md font-black shadow-md tracking-wider border border-white/40 backdrop-blur-xs scale-105 transition-transform">
                                          ⚡ {hoverCell.horaTexto}
                                        </span>
                                      </div>
                                    )}

                         {citasInicianAqui.length > 0 ? (
                                      citasInicianAqui.map((item, cIdx) => {
                                        const estadoCita = (item.estado || '').toLowerCase();
                                        const esFinalizada = estadoCita === 'finalizada' || estadoCita === 'finalizado';
                                        const serviciosList = item.serviciosArray && item.serviciosArray.length > 0 
                                          ? item.serviciosArray 
                                          : [{ nombre: item.servicio, duracion: item.duracion || 30, color: '#2563eb' }];

                                        let acumuladorMinutosOffset = 0;

                                        return serviciosList.map((serv, sIdx) => {
                                          const minInicioCita = horaAMinutos(item.hora) + acumuladorMinutosOffset;
                                          const offsetMinutos = minInicioCita - minutosFilaInicio;
                                          const topPx = Math.max(2, (offsetMinutos / 60) * rowHeightPx);
                                          const duracionServ = Number(serv.duracion) || 30;
                                          const alturaPxServ = Math.max(28, (duracionServ / 60) * rowHeightPx);
                                          
                                          acumuladorMinutosOffset += duracionServ;

                                          const colorFondo = serv.color || '#2563eb';

                                          return (
                                            <div 
                                              key={`${cIdx}_${sIdx}`}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setCitaSeleccionada(item);
                                                setEstadoTemporal(item.estado);
                                                setModalDetalleAbierto(true);
                                              }}
                                              className="absolute left-0.5 right-0.5 p-1 border rounded-lg flex flex-col justify-between text-white shadow-md z-20 cursor-pointer backdrop-blur-xs transition-all hover:scale-[1.01]"
                                              style={{
                                                top: `${topPx}px`,
                                                height: `${alturaPxServ}px`,
                                                backgroundColor: colorFondo,
                                                borderColor: 'rgba(255, 255, 255, 0.3)'
                                              }}
                                              title={`${item.cliente} - ${serv.nombre} (${duracionServ} min)`}
                                            >
                                              <div className="flex items-center justify-between gap-1 min-w-0">
                                                <span className="font-black truncate text-[9px] leading-tight text-white">
                                                  {item.cliente} {serviciosList.length > 1 ? `(${sIdx + 1}/${serviciosList.length})` : ''}
                                                </span>
                                                <span className="text-[7.5px] font-mono font-bold opacity-90 shrink-0 bg-black/20 px-1 rounded text-white">
                                                  {item.hora}
                                                </span>
                                              </div>
                                              
                                              <div className="truncate text-[9px] font-bold text-white/95">
                                                {serv.nombre}
                                              </div>

                                              <div className="flex items-center justify-between text-[7.5px] font-bold text-white/90 pt-0.5 border-t border-white/20">
                                                <span>⏱️ {duracionServ} min</span>
                                                <span className="uppercase px-1 rounded bg-black/20 text-white border border-white/20">
                                                  {item.estado || 'Pendiente'}
                                                </span>
                                              </div>
                                            </div>
                                          );
                                        });
                                      })
                                    ) : bloqueosInicianAqui.length === 0 && (
                                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-blue-500 text-[12px] font-bold pointer-events-none">
                                        +
                                      </div>
                                    )}
                                  </div>
                                );
                              })}

                            </div>
                          );
                        })}
                      </div>

                    </div>
                  )}
                </div>

              </div>
            );
          })()}

          {seccionActiva === 'servicios' && <Servicios />}
          {seccionActiva === 'inventario' && <InventarioEstablecimiento />}
          {seccionActiva === 'producido' && <Producido />}
          {seccionActiva === 'profesionales' && <GestionProfesionales />}

        </main>
      </div>

      {modalBarberosOpen && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-blue-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="px-5 py-4 border-b border-blue-100 bg-blue-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-slate-900 uppercase tracking-wide text-xs">Vincular Profesional por Correo</h3>
              </div>
              <button 
                onClick={() => setModalBarberosOpen(false)}
                className="w-7 h-7 rounded-lg bg-white border border-blue-200 text-slate-500 hover:text-red-600 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={buscarProfesionalPorCorreo} className="p-4 border-b border-slate-100 bg-white space-y-3">
              <label className="block text-[10px] font-bold text-slate-600 uppercase">Correo Electrónico del Profesional</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={correoBusqueda}
                    onChange={(e) => setCorreoBusqueda(e.target.value)}
                    className="w-full bg-blue-50/50 border border-blue-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 outline-none focus:border-blue-600 transition-all placeholder-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={buscando}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  {buscando ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
              {msgBusqueda && <p className="text-[10px] text-amber-600 font-bold">{msgBusqueda}</p>}
            </form>

            <div className="p-4 bg-slate-50 min-h-[140px] flex flex-col justify-center">
              {!resultadoBusqueda ? (
                <div className="text-center text-slate-400 text-xs py-4">
                  Ingresa un correo electrónico arriba y presiona "Buscar" para encontrar al profesional en el sistema.
                </div>
              ) : (
                <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-2xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs overflow-hidden shrink-0 shadow-xs">
                      {resultadoBusqueda.foto ? (
                        <img src={resultadoBusqueda.foto} alt={resultadoBusqueda.nombre} className="w-full h-full object-cover" />
                      ) : (
                        (resultadoBusqueda.nombre || 'P').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-xs">{resultadoBusqueda.nombre || 'Sin Nombre'}</p>
                      <p className="text-[10px] text-slate-500">{resultadoBusqueda.email}</p>
                      <span className="text-[9px] font-bold text-blue-700 mt-0.5 block">
                        {resultadoBusqueda.especialidad || 'Especialista'}
                      </span>
                    </div>
                  </div>

                  <div>
                    {authUser && resultadoBusqueda.establecimientoId === authUser.uid ? (
                      <button
                        onClick={() => desvincularBarbero(resultadoBusqueda.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Unlink className="w-3.5 h-3.5" /> Desvincular
                      </button>
                    ) : resultadoBusqueda.establecimientoId ? (
                      <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-2 py-1 rounded-md border border-rose-200">
                        Ocupado en otro local
                      </span>
                    ) : (
                      <button
                        onClick={() => vincularBarbero(resultadoBusqueda.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        <LinkIcon className="w-3.5 h-3.5" /> Vincular
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-100 bg-white flex justify-end">
              <button 
                onClick={() => setModalBarberosOpen(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-1.5 rounded-xl text-xs font-bold uppercase cursor-pointer transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {profesionalADesvincular && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-red-200 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-5 text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Unlink className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-slate-900 uppercase text-xs">Desvincular Profesional</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                ¿Estás seguro de que deseas desvincular a <strong className="text-slate-900">{profesionalADesvincular.nombre}</strong> de tu establecimiento? Ya no aparecerá en tu matriz de agenda.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setProfesionalADesvincular(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-[10px] uppercase transition-all cursor-pointer border border-slate-200"
              >
                No, Cancelar
              </button>
              <button 
                onClick={() => desvincularBarbero(profesionalADesvincular.id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-2 rounded-xl text-[10px] uppercase transition-all cursor-pointer shadow-md shadow-red-500/20 active:scale-95"
              >
                Sí, Desvincular
              </button>
            </div>
          </div>
        </div>
      )}

      {modalHorarioOpen && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 font-mono">
          <div className="bg-white border border-blue-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="px-5 py-4 border-b border-blue-100 bg-blue-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-slate-900 uppercase tracking-wide text-xs">Horario de Atención por Día</h3>
              </div>
              <button 
                onClick={() => setModalHorarioOpen(false)}
                className="w-7 h-7 rounded-lg bg-white border border-blue-200 text-slate-500 hover:text-red-600 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarHorarioSemanal} className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
              {Object.keys(diasSemanaDefecto).map((diaKey) => {
                const configDia = horarioSemanalTemp[diaKey] || diasSemanaDefecto[diaKey];
                const nombresDias = {
                  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
                  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo'
                };

                return (
                  <div key={diaKey} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3 w-28">
                      <input 
                        type="checkbox"
                        checked={configDia.abierto}
                        onChange={(e) => {
                          const abierto = e.target.checked;
                          setHorarioSemanalTemp(prev => ({
                            ...prev,
                            [diaKey]: { ...configDia, abierto }
                          }));
                        }}
                        className="w-4 h-4 accent-blue-600 cursor-pointer"
                      />
                      <span className={`font-black uppercase text-[11px] ${configDia.abierto ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                        {nombresDias[diaKey]}
                      </span>
                    </div>

                    {configDia.abierto ? (
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <select
                          value={configDia.apertura}
                          onChange={(e) => {
                            const apertura = e.target.value;
                            setHorarioSemanalTemp(prev => ({
                              ...prev,
                              [diaKey]: { ...configDia, apertura }
                            }));
                          }}
                          className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-[10px] font-bold text-blue-900 outline-none"
                        >
                          {horasCalendario.map((h, i) => (
                            <option key={i} value={h.label}>{h.label}</option>
                          ))}
                        </select>
                        <span className="text-slate-400 font-bold">a</span>
                        <select
                          value={configDia.cierre}
                          onChange={(e) => {
                            const cierre = e.target.value;
                            setHorarioSemanalTemp(prev => ({
                              ...prev,
                              [diaKey]: { ...configDia, cierre }
                            }));
                          }}
                          className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-[10px] font-bold text-blue-900 outline-none"
                        >
                          {horasCalendario.map((h, i) => (
                            <option key={i} value={h.label}>{h.label}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span className="text-red-500 font-bold text-[10px] uppercase bg-red-50 px-2 py-1 rounded-md border border-red-200">
                        Cerrado (No laborable)
                      </span>
                    )}
                  </div>
                );
              })}

              <div className="pt-3 border-t border-slate-100 flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalHorarioOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl uppercase text-[10px] cursor-pointer border border-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoHorario}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-black py-2.5 rounded-xl uppercase tracking-wider text-[10px] shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {guardandoHorario ? 'Guardando...' : 'Guardar Horarios'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal Lateral (Slide-Over) para Agendar o Gestionar Bloqueos */}
      {modalCitaOpen && (
        <div 
          className={`fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex justify-end transition-opacity duration-300 ease-out ${
            modalCitaOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setModalCitaOpen(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`bg-white w-full max-w-sm h-full shadow-2xl flex flex-col border-l border-blue-200 font-mono transition-transform duration-300 ease-out transform ${
              modalCitaOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            
<div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-sky-500 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black uppercase text-xs tracking-wider">
                  {tipoAccionModal === 'editarBloqueo' ? 'Gestionar Bloqueo' : tipoAccionModal === 'cita' ? 'Nueva cita' : 'Gestión de Horario'}
                </h3>
                <p className="text-[9px] text-sky-100">
                  {citaSeleccionData.prof?.nombre || bloqueoEnEdicion?.barberoName}
                </p>
              </div>
              <button 
                onClick={() => setModalCitaOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

    {tipoAccionModal === 'selector' ? (
              <div className="p-5 flex-1 flex flex-col justify-center gap-3 text-xs">
                <p className="text-slate-600 font-bold text-center mb-2">¿Qué deseas hacer en este horario?</p>
                
                <button
                  onClick={() => setTipoAccionModal('cita')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-4 rounded-xl uppercase tracking-wider text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  📅 Agendar Cita
                </button>

                <button
                  onClick={() => setTipoAccionModal('bloqueo')}
                  className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-black py-3 px-4 rounded-xl uppercase tracking-wider text-xs transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-300"
                >
                  🚫 Agregar Bloqueo (No disponible)
                </button>
              </div>
            ) : tipoAccionModal === 'bloqueo' || tipoAccionModal === 'editarBloqueo' ? (
              <form onSubmit={handleGuardarBloqueoRango} className="p-4 flex-1 overflow-y-auto space-y-4 text-[11px]">
                <div className="bg-slate-100 border border-slate-200 p-3 rounded-xl space-y-1">
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Configuración de Bloqueo</p>
                  <p className="font-black text-rose-600 text-xs">🚫 Horario No Disponible</p>
                  <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-700 font-bold border-t border-slate-200">
                    <span>📅 {fechaStrActual}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-700 uppercase">Hora de Inicio</label>
                  <select
                    value={horaInicioBloqueo}
                    onChange={(e) => setHoraInicioBloqueo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-600"
                  >
                    {horasCalendario.map((h, i) => (
                      <option key={i} value={h.label}>{h.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-700 uppercase">Hora Final</label>
                  <select
                    value={horaFinBloqueo}
                    onChange={(e) => setHoraFinBloqueo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-600"
                  >
                    {horasCalendario.map((h, i) => (
                      <option key={i} value={h.label}>{h.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-700 uppercase">Motivo del Bloqueo</label>
                  <input 
                    type="text"
                    placeholder="Ej. Almuerzo, Descanso, Mantenimiento"
                    value={motivoBloqueo}
                    onChange={(e) => setMotivoBloqueo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-600 font-mono"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex gap-2">
                    {tipoAccionModal === 'bloqueo' && (
                      <button
                        type="button"
                        onClick={() => setTipoAccionModal('selector')}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl uppercase text-[10px] cursor-pointer border border-slate-200"
                      >
                        Volver
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={guardandoCita}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black py-2.5 rounded-xl uppercase tracking-wider text-[10px] shadow-md shadow-rose-500/20 cursor-pointer"
                    >
                      {guardandoCita ? 'Guardando...' : (bloqueoEnEdicion ? 'Actualizar Bloqueo' : 'Confirmar Bloqueo')}
                    </button>
                  </div>

                  {bloqueoEnEdicion && (
                    <button
                      type="button"
                      onClick={handleEliminarBloqueo}
                      disabled={guardandoCita}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 rounded-xl uppercase text-[10px] cursor-pointer border border-red-200 transition-all"
                    >
                      🗑️ Eliminar Bloqueo
                    </button>
                  )}
                </div>
              </form>
            ) : (
        <form 
onSubmit={async (e) => {
    e.preventDefault();
    if (!citaSeleccionData.prof || !citaSeleccionData.hora) return;

    // --- NORMALIZACIÓN ESTRICTA DE LA HORA ---
    let horaRaw = String(citaSeleccionData.hora).trim();
    // Si la hora elegida es de la tarde (ej: 3:00 p. m., 15:00, etc.)
    // Aseguramos que guarde el formato exacto que renderiza tus filas de la tarde
    let horaFinal = horaRaw;
    if (horaRaw.toLowerCase().includes('p. m.') || horaRaw.toLowerCase().includes('pm')) {
      // Normalizamos a un formato estándar de 12 horas con espacios limpios
      const partes = horaRaw.replace(/p\.?\s*m\.?/gi, '').trim();
      horaFinal = `${partes} p. m.`;
    } else if (horaRaw.startsWith('13:') || horaRaw.startsWith('14:') || horaRaw.startsWith('15:') || 
               horaRaw.startsWith('16:') || horaRaw.startsWith('17:') || horaRaw.startsWith('18:') || 
               horaRaw.startsWith('19:') || horaRaw.startsWith('20:') || horaRaw.startsWith('21:') || 
               horaRaw.startsWith('22:') || horaRaw.startsWith('23:')) {
      const [hStr, mStr] = horaRaw.split(':');
      let hNum = parseInt(hStr, 10);
      if (hNum > 12) hNum -= 12;
      horaFinal = `${hNum}:${mStr || '00'} p. m.`;
    }
    // ------------------------------------------

    setGuardandoCita(true);
    try {
      const telefonoLimpio = telefonoCliente.trim();
      const nombreLimpio = (window._clienteNombreTemp || '').trim();
      const apellidoLimpio = (window._clienteApellidoTemp || '').trim();
      const correoLimpio = (window._clienteCorreoTemp || '').trim();

      let clienteIdFinal = null;
      if (telefonoLimpio) {
        const qCliente = query(
          collection(db, 'clientesestablecimiento'),
          where('establecimientoId', '==', auth.currentUser.uid),
          where('telefono', '==', telefonoLimpio)
        );
        const snapCliente = await getDocs(qCliente);

        if (!snapCliente.empty) {
          clienteIdFinal = snapCliente.docs[0].id;
        } else {
          const nuevoClienteRef = await addDoc(collection(db, 'clientesestablecimiento'), {
            establecimientoId: auth.currentUser.uid,
            nombre: nombreLimpio,
            apellido: apellidoLimpio,
            telefono: telefonoLimpio,
            correo: correoLimpio,
            barberoId: citaSeleccionData.prof.id,
            barberoName: citaSeleccionData.prof.nombre,
            createdAt: new Date().toISOString()
          });
          clienteIdFinal = nuevoClienteRef.id;
        }
      }

      const serviciosObjs = serviciosSeleccionados.map(sIdx => 
        serviciosEstablecimiento[sIdx]
      ).filter(Boolean);

      const nombresServiciosStr = serviciosObjs.map(s => s.nombre).join(', ') || 'Servicio General';
      const precioTotalSuma = serviciosObjs.reduce((acc, s) => acc + (Number(s.precio) || 0), 0);
      const duracionTotalSuma = serviciosObjs.reduce((acc, s) => acc + (Number(s.duracion) || 30), 30);
      const nombreClienteCompleto = `${nombreLimpio} ${apellidoLimpio}`.trim() || 'Cliente General';

      const nuevaCita = {
        id: 'cita_' + Date.now(),
        establecimientoId: auth.currentUser?.uid,
        barberoId: citaSeleccionData.prof.id,
        barberoName: citaSeleccionData.prof.nombre,
        cliente: nombreClienteCompleto,
        clienteNombre: nombreLimpio,
        clienteApellido: apellidoLimpio,
        clienteTelefono: telefonoLimpio,
        clienteEmail: correoLimpio,
        clienteId: clienteIdFinal || '',
        servicio: nombresServiciosStr,
        serviciosArray: serviciosObjs,
        precio: precioTotalSuma,
        precioTotal: precioTotalSuma,
        duracion: duracionTotalSuma,
        hora: horaFinal, // Usamos la hora normalizada
        fechaStr: fechaStrActual,
        fecha: fechaStrActual,
        estado: 'Pendiente',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'citas'), nuevaCita);

      setSuccessMsg('¡Cita registrada y cliente sincronizado correctamente!');
      setModalCitaOpen(false);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error("Error al registrar cita y cliente:", err);
      setErrorMsg('No se pudo registrar la cita. Inténtalo de nuevo.');
      setTimeout(() => setErrorMsg(''), 3500);
    } finally {
      setGuardandoCita(false);
    }
  }}
  >
  {/* Tarjeta de Resumen con Selector de Hora Editable */}
  <div className="relative bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 p-[1px] rounded-2xl shadow-lg shadow-blue-500/10">
    <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl space-y-1">
      <p className="text-[8px] font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent uppercase tracking-wider flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
        Matriz Arkana Vision
      </p>
      <p className="font-black text-slate-900 text-xs">{citaSeleccionData.prof?.nombre}</p>
      <div className="flex items-center justify-between pt-1 text-[10px] text-blue-700 font-bold border-t border-sky-100">
        <span>📅 {fechaStrActual}</span>
        
        {/* Selector de hora integrado con horasCalendario para evitar errores de AM/PM */}
        <div className="flex items-center gap-1">
          <span>⏰</span>
          <select
            value={citaSeleccionData.hora || ''}
            onChange={(e) => setCitaSeleccionada ? null : setCitaSeleccionData(prev => ({ ...prev, hora: e.target.value }))}
            className="bg-sky-50 border border-sky-200 rounded-lg px-2 py-0.5 text-[10px] font-bold text-blue-900 outline-none cursor-pointer"
          >
            {(horasCalendario || []).map((h, i) => (
              <option key={i} value={h.label}>{h.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  </div>

  {/* Campo Teléfono */}
  <div className="space-y-1">
    <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-wider">Teléfono del Cliente <span className="text-blue-600">*</span></label>
    <input 
      type="tel"
      required
      placeholder="Ej. 3001234567"
      value={telefonoCliente}
      onChange={async (e) => {
        const tel = e.target.value;
        setTelefonoCliente(tel);
        window._clienteTelefonoTemp = tel;

        if (tel.trim().length >= 7 && auth?.currentUser) {
          try {
            const q = query(
              collection(db, 'clientesestablecimiento'),
              where('establecimientoId', '==', auth.currentUser.uid),
              where('telefono', '==', tel.trim())
            );
            const snap = await getDocs(q);
            if (!snap.empty) {
              const dataC = snap.docs[0].data();
              const inputNombre = document.getElementById('inputNombreCliente');
              const inputApellido = document.getElementById('inputApellidoCliente');
              const inputCorreo = document.getElementById('inputCorreoCliente');

              if (inputNombre) inputNombre.value = dataC.nombre || '';
              if (inputApellido) inputApellido.value = dataC.apellido || '';
              if (inputCorreo) inputCorreo.value = dataC.correo || '';

              window._clienteNombreTemp = dataC.nombre || '';
              window._clienteApellidoTemp = dataC.apellido || '';
              window._clienteCorreoTemp = dataC.correo || '';
            }
          } catch (err) {
            console.error("Error buscando cliente:", err);
          }
        }
      }}
      className="w-full bg-white/90 border border-sky-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono placeholder-slate-400 shadow-2xs"
    />
    <p className="text-[8px] text-slate-400">Autocompletado inteligente por número registrado.</p>
  </div>

  {/* Campos Nombre y Apellido */}
  <div className="grid grid-cols-2 gap-2">
    <div className="space-y-1">
      <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-wider">Nombre <span className="text-blue-600">*</span></label>
      <input 
        id="inputNombreCliente"
        type="text"
        required
        placeholder="Ej. Carlos"
        onChange={(e) => { window._clienteNombreTemp = e.target.value; }}
        className="w-full bg-white/90 border border-sky-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-slate-400 shadow-2xs"
      />
    </div>
    <div className="space-y-1">
      <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-wider">Apellido <span className="text-blue-600">*</span></label>
      <input 
        id="inputApellidoCliente"
        type="text"
        required
        placeholder="Ej. Pérez"
        onChange={(e) => { window._clienteApellidoTemp = e.target.value; }}
        className="w-full bg-white/90 border border-sky-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-slate-400 shadow-2xs"
      />
    </div>
  </div>

  {/* Campo Correo */}
  <div className="space-y-1">
    <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-wider">Correo Electrónico <span className="text-slate-400 font-normal">(Opcional)</span></label>
    <input 
      id="inputCorreoCliente"
      type="email"
      placeholder="correo@ejemplo.com"
      onChange={(e) => { window._clienteCorreoTemp = e.target.value; }}
      className="w-full bg-white/90 border border-sky-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono placeholder-slate-400 shadow-2xs"
    />
  </div>

  {/* Select Múltiple de Servicios */}
  <div className="space-y-2 relative">
    <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-wider">
      Seleccionar Servicios <span className="text-blue-600">*</span>
    </label>
    
    <div 
      onClick={() => setDropdownServiciosOpen(!dropdownServiciosOpen)}
      className="w-full bg-white/90 border border-sky-200/80 rounded-xl px-3.5 py-3 text-xs text-slate-800 cursor-pointer flex items-center justify-between shadow-xs hover:border-blue-500 transition-all"
    >
      <span className="font-bold text-slate-700">
        {serviciosSeleccionados.length > 0 
          ? `${serviciosSeleccionados.length} servicio(s) seleccionado(s)` 
          : 'Selecciona uno o más servicios...'}
      </span>
      <span className="text-blue-600 text-xs font-bold transition-transform duration-300" style={{ transform: dropdownServiciosOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
        ▼
      </span>
    </div>

    {dropdownServiciosOpen && (
      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white/95 border border-sky-200 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto p-1.5 space-y-1 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
        {serviciosEstablecimiento && serviciosEstablecimiento.length > 0 ? (
          serviciosEstablecimiento.map((serv, sIdx) => {
            const isSelected = serviciosSeleccionados.includes(sIdx);
            const colorServicio = serv.color || '#2563eb';

            return (
              <div 
                key={sIdx}
                onClick={() => {
                  if (isSelected) {
                    setServiciosSeleccionados(serviciosSeleccionados.filter(index => index !== sIdx));
                  } else {
                    setServiciosSeleccionados([...serviciosSeleccionados, sIdx]);
                  }
                  setDropdownServiciosOpen(false);
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected ? 'bg-gradient-to-r from-sky-50 to-blue-50 border-blue-300 font-bold text-blue-900' : 'bg-white border-transparent hover:bg-sky-50/50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: colorServicio }}></span>
                  <p className="text-xs truncate">{serv.nombre}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-xs text-slate-800">${Number(serv.precio || 0).toLocaleString()}</span>
                  {isSelected && <span className="text-blue-600 font-bold text-xs">✓</span>}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-3 text-center text-slate-400 text-[10px]">
            No hay servicios disponibles en este establecimiento.
          </div>
        )}
      </div>
    )}

    {serviciosSeleccionados.length > 0 && (
      <div className="flex flex-wrap gap-1.5 pt-1">
        {serviciosSeleccionados.map((sIdx) => {
          const servObj = serviciosEstablecimiento[sIdx];
          if (!servObj) return null;
          return (
            <div 
              key={sIdx} 
              className="flex items-center gap-1.5 bg-gradient-to-r from-sky-100 to-blue-100 border border-sky-300 text-blue-950 px-3 py-1 rounded-full text-[10px] font-bold shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: servObj.color || '#2563eb' }}></span>
              <span>{servObj.nombre} (${Number(servObj.precio || 0).toLocaleString()})</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setServiciosSeleccionados(serviciosSeleccionados.filter(index => index !== sIdx));
                }}
                className="text-blue-700 hover:text-red-600 font-black ml-0.5 cursor-pointer"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    )}
  </div>

  {/* Resumen Total */}
  <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-cyan-50 border border-sky-200 p-3.5 rounded-xl flex items-center justify-between shadow-2xs">
    <span className="text-[10px] font-black bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent uppercase tracking-wider">Total Servicios:</span>
    <span className="text-xs font-black text-blue-700 tracking-wider">
      ${serviciosSeleccionados.reduce((acc, sIdx) => {
        const servObj = serviciosEstablecimiento[sIdx];
        const precioNum = Number(String(servObj?.precio || 0).replace(/[^0-9]/g, '')) || 0;
        return acc + precioNum;
      }, 0).toLocaleString()} COP
    </span>
  </div>

  {/* Botones */}
  <div className="pt-4 border-t border-sky-100 flex gap-2">
    <button
      type="button"
      onClick={() => setTipoAccionModal('selector')}
      className="flex-1 bg-white hover:bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl uppercase text-[10px] cursor-pointer border border-sky-200 transition-all shadow-2xs"
    >
      Volver
    </button>
    <button
      type="submit"
      disabled={guardandoCita || serviciosEstablecimiento.length === 0}
      className="flex-1 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 hover:from-blue-700 hover:to-cyan-500 text-white font-black py-2.5 rounded-xl uppercase tracking-wider text-[10px] shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
    >
      {guardandoCita ? 'Procesando...' : 'Agendar Cita'}
    </button>
  </div>
</form>
            )}

          </div>
        </div>
      )}

      {modalDetalleAbierto && citaSeleccionada && (() => {
  // Inicializar índices de servicios seleccionados si no existen
  if (!window._detalleServiciosIndices && citaSeleccionada) {
    const arrInicial = [];
    if (citaSeleccionada.serviciosArray && Array.isArray(citaSeleccionada.serviciosArray)) {
      citaSeleccionada.serviciosArray.forEach(servCita => {
        const idxEncontrado = (serviciosEstablecimiento || []).findIndex(s => s.nombre === servCita.nombre);
        if (idxEncontrado !== -1 && !arrInicial.includes(idxEncontrado)) {
          arrInicial.push(idxEncontrado);
        }
      });
    }
    window._detalleServiciosIndices = arrInicial;
    window._detalleDropdownOpen = false;
  }

  // Inicializar profesional temporal si no existe
  if (window._detalleBarberoTemp === undefined && citaSeleccionada) {
    window._detalleBarberoTemp = citaSeleccionada.barberoId || '';
  }

  return (
    <div className="fixed inset-0 z-[99999] flex justify-end bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 overflow-y-auto font-mono text-xs">
        
        <div>
          <div className={`p-4 border-b flex items-center justify-between shadow-md transition-colors duration-300 ${obtenerColorEstado(citaSeleccionada.estado)}`}>
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-90 flex items-center gap-1">
                📅 {citaSeleccionada.fechaStr || 'Fecha no especificada'}
              </span>
              <h3 className="text-sm font-black uppercase tracking-wide">
                {citaSeleccionada.estado ? `Estado: ${citaSeleccionada.estado}` : 'Cita Activa'}
              </h3>
            </div>
            
            <button 
              type="button"
              onClick={() => {
                window._detalleServiciosIndices = null;
                window._detalleBarberoTemp = undefined;
                setModalDetalleAbierto(false);
              }}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-xs backdrop-blur-xs transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black uppercase text-blue-600 tracking-wider">Detalles de la Cita</span>
              <h2 className="text-base font-black text-slate-900 leading-tight">{citaSeleccionada.cliente}</h2>
            </div>
            <span className="text-[10px] font-mono font-bold bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-700 shadow-2xs">
              ⏰ {citaSeleccionada.hora || 'Sin Hora'}
            </span>
          </div>

          <div className="p-5 space-y-4">
            
            <div className="bg-sky-50/60 border border-sky-100 p-3 rounded-xl space-y-1">
              <p className="text-xs text-slate-700"><strong>Teléfono:</strong> {citaSeleccionada.clienteTelefono || 'No registrado'}</p>
              <p className="text-xs text-slate-700"><strong>Correo:</strong> {citaSeleccionada.clienteEmail || 'No registrado'}</p>
            </div>

            {/* SECCIÓN CAMBIAR PROFESIONAL */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Profesional Asignado</label>
              <select
                value={window._detalleBarberoTemp}
                onChange={(e) => {
                  window._detalleBarberoTemp = e.target.value;
                  setCitaSeleccionada({...citaSeleccionada});
                }}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none cursor-pointer text-slate-800"
              >
                <option value="">Selecciona un profesional...</option>
                {(typeof profesionales !== 'undefined' ? profesionales : (typeof empleados !== 'undefined' ? empleados : [])).map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* SECCIÓN DE SERVICIOS CON BURBUJAS Y SELECTOR */}
            <div className="space-y-2 relative">
              <label className="text-xs font-bold text-slate-700 block">Servicios Seleccionados</label>
              
              <div 
                onClick={() => {
                  window._detalleDropdownOpen = !window._detalleDropdownOpen;
                  setCitaSeleccionada({...citaSeleccionada});
                }}
                className="w-full bg-white border border-sky-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 cursor-pointer flex items-center justify-between shadow-xs hover:border-blue-500 transition-all"
              >
                <span className="font-bold text-slate-700">
                  {window._detalleServiciosIndices.length > 0 
                    ? `${window._detalleServiciosIndices.length} servicio(s) seleccionado(s)` 
                    : 'Agregar o cambiar servicios...'}
                </span>
                <span className="text-blue-600 font-bold text-xs transition-transform duration-300" style={{ transform: window._detalleDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  ▼
                </span>
              </div>

              {window._detalleDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-blue-200 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto p-1.5 space-y-1 backdrop-blur-xl">
                  {serviciosEstablecimiento && serviciosEstablecimiento.length > 0 ? (
                    serviciosEstablecimiento.map((serv, sIdx) => {
                      const isSelected = window._detalleServiciosIndices.includes(sIdx);
                      const colorServicio = serv.color || '#2563eb';

                      return (
                        <div 
                          key={sIdx}
                          onClick={() => {
                            if (isSelected) {
                              window._detalleServiciosIndices = window._detalleServiciosIndices.filter(i => i !== sIdx);
                            } else {
                              window._detalleServiciosIndices = [...window._detalleServiciosIndices, sIdx];
                            }
                            window._detalleDropdownOpen = false;
                            setCitaSeleccionada({...citaSeleccionada});
                          }}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected ? 'bg-sky-50 border-blue-300 font-bold text-blue-900' : 'bg-white border-transparent hover:bg-sky-50/50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: colorServicio }}></span>
                            <p className="text-xs truncate">{serv.nombre}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-xs text-slate-800">${Number(serv.precio || 0).toLocaleString()}</span>
                            {isSelected && <span className="text-blue-600 font-bold text-xs">✓</span>}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 text-center text-slate-400 text-[10px]">
                      No hay servicios disponibles.
                    </div>
                  )}
                </div>
              )}

              {/* Burbujas de servicios seleccionados */}
              {window._detalleServiciosIndices.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {window._detalleServiciosIndices.map((sIdx) => {
                    const servObj = serviciosEstablecimiento[sIdx];
                    if (!servObj) return null;
                    return (
                      <div 
                        key={sIdx} 
                        className="flex items-center gap-1.5 bg-gradient-to-r from-sky-100 to-blue-100 border border-sky-300 text-blue-950 px-3 py-1 rounded-full text-[10px] font-bold shadow-2xs"
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: servObj.color || '#2563eb' }}></span>
                        <span>{servObj.nombre} (${Number(servObj.precio || 0).toLocaleString()})</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            window._detalleServiciosIndices = window._detalleServiciosIndices.filter(i => i !== sIdx);
                            setCitaSeleccionada({...citaSeleccionada});
                          }}
                          className="text-blue-700 hover:text-red-600 font-black ml-0.5 cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Total a Pagar Dinámico */}
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900">Total a Pagar:</span>
              <span className="text-sm font-black text-emerald-700">
                ${window._detalleServiciosIndices.reduce((acc, sIdx) => {
                  const servObj = serviciosEstablecimiento[sIdx];
                  const precioNum = Number(String(servObj?.precio || 0).replace(/[^0-9]/g, '')) || 0;
                  return acc + precioNum;
                }, 0).toLocaleString()} COP
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Fecha</label>
                <input 
                  type="date"
                  value={citaSeleccionada.fechaStr || ''}
                  onChange={(e) => setCitaSeleccionada({...citaSeleccionada, fechaStr: e.target.value})}
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Hora</label>
                <input 
                  type="text"
                  value={citaSeleccionada.hora || ''}
                  onChange={(e) => setCitaSeleccionada({...citaSeleccionada, hora: e.target.value})}
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Estado de la Cita</label>
              <select
                value={estadoTemporal}
                onChange={(e) => {
                  const valor = e.target.value;
                  if (valor === 'cancelada' || valor === 'inasistente') {
                    setNuevoEstadoSeleccionado(valor);
                    setMostrarConfirmacionEstado(true);
                  } else {
                    setEstadoTemporal(valor);
                    setCitaSeleccionada({...citaSeleccionada, estado: valor});
                  }
                }}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none cursor-pointer"
              >
                <option value="activa">Activa</option>
                <option value="confirmada">Confirmada</option>
                <option value="finalizada">Finalizada</option>
                <option value="cancelada">Cancelada</option>
                <option value="inasistente">Inasistente</option>
              </select>
            </div>

            {mostrarConfirmacionEstado && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl animate-in fade-in">
                <p className="text-xs font-bold text-rose-900 mb-2">
                  ¿Confirmas cambiar el estado a <span className="uppercase text-rose-700 font-black">{nuevoEstadoSeleccionado}</span>?
                </p>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setEstadoTemporal(nuevoEstadoSeleccionado);
                      setCitaSeleccionada({...citaSeleccionada, estado: nuevoEstadoSeleccionado});
                      setMostrarConfirmacionEstado(false);
                    }}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs py-1.5 rounded-lg font-bold transition cursor-pointer"
                  >
                    Sí, cambiar
                  </button>
                  <button 
                    type="button"
                    onClick={() => setMostrarConfirmacionEstado(false)}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs py-1.5 rounded-lg font-bold transition cursor-pointer"
                  >
                    No, mantener
                  </button>
                </div>
              </div>
            )}

            {/* BOTÓN ELIMINAR CITA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={async () => {
                  if (window.confirm("¿Estás seguro de que deseas eliminar esta cita permanentemente?")) {
                    try {
                      await deleteDoc(doc(db, 'citas', citaSeleccionada.id));
                      setSuccessMsg('¡Cita eliminada correctamente!');
                      window._detalleServiciosIndices = null;
                      window._detalleBarberoTemp = undefined;
                      setModalDetalleAbierto(false);
                      setTimeout(() => setSuccessMsg(''), 3000);
                    } catch (err) {
                      console.error("Error al eliminar la cita:", err);
                      setErrorMsg('No se pudo eliminar la cita.');
                      setTimeout(() => setErrorMsg(''), 3000);
                    }
                  }
                }}
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold py-2.5 rounded-xl uppercase text-[10px] transition cursor-pointer"
              >
                Eliminar Cita
              </button>
            </div>

          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
          <button 
            type="button"
            onClick={() => {
              window._detalleServiciosIndices = null;
              window._detalleBarberoTemp = undefined;
              setModalDetalleAbierto(false);
            }}
            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs py-2.5 rounded-xl font-bold transition cursor-pointer"
          >
            Cerrar
          </button>
          <button 
            type="button"
            onClick={async () => {
              try {
                const serviciosObjsFinales = window._detalleServiciosIndices.map(i => serviciosEstablecimiento[i]).filter(Boolean);
                const nombresStr = serviciosObjsFinales.map(s => s.nombre).join(', ') || 'Servicio General';
                const precioSuma = serviciosObjsFinales.reduce((acc, s) => acc + (Number(s.precio) || 0), 0);
                const duracionSuma = serviciosObjsFinales.reduce((acc, s) => acc + (Number(s.duracion) || 30), 30);

                const listaProf = typeof profesionales !== 'undefined' ? profesionales : (typeof empleados !== 'undefined' ? empleados : []);
                const profObj = listaProf.find(p => p.id === window._detalleBarberoTemp);

                const citaRef = doc(db, 'citas', citaSeleccionada.id);
                await updateDoc(citaRef, {
                  barberoId: window._detalleBarberoTemp || citaSeleccionada.barberoId,
                  barberoName: profObj ? profObj.nombre : citaSeleccionada.barberoName,
                  servicio: nombresStr,
                  serviciosArray: serviciosObjsFinales,
                  precio: precioSuma,
                  precioTotal: precioSuma,
                  duracion: duracionSuma,
                  fecha: citaSeleccionada.fechaStr,
                  fechaStr: citaSeleccionada.fechaStr,
                  hora: citaSeleccionada.hora,
                  estado: estadoTemporal || citaSeleccionada.estado
                });

                setSuccessMsg('¡Cita actualizada correctamente!');
                window._detalleServiciosIndices = null;
                window._detalleBarberoTemp = undefined;
                setModalDetalleAbierto(false);
                setTimeout(() => setSuccessMsg(''), 3000);
              } catch (err) {
                console.error("Error al actualizar cita:", err);
                setErrorMsg('No se pudo actualizar la cita.');
                setTimeout(() => setErrorMsg(''), 3000);
              }
            }}
            className="flex-1 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white text-xs py-2.5 rounded-xl font-bold shadow-md transition cursor-pointer"
          >
            Guardar Cambios
          </button>
        </div>

      </div>
    </div>
  );
})()}
    </div>
  );
}