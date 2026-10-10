import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, Sparkles, CheckCircle2, Clock, 
  AlertCircle, ShieldCheck, Filter, RefreshCw, LogOut, Check, Search, TrendingUp, Scissors, UserPlus, X, Link as LinkIcon, Unlink, LayoutDashboard, Settings, DollarSign, Globe, Copy, ExternalLink
} from 'lucide-react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, where, doc, getDoc, updateDoc, addDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../../../components/firebase';
import Servicios from './Servicios';

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
  
  // Control de secciones activas del menú lateral
  const [seccionActiva, setSeccionActiva] = useState('agenda'); // 'agenda', 'servicios', 'equipo', 'configuracion'

  const [profesionales, setProfesionales] = useState([]);
  const [citas, setCitas] = useState([]);
  const [serviciosEstablecimiento, setServiciosEstablecimiento] = useState([]);

  // Estados para creación de servicios
  const [nombreServicio, setNombreServicio] = useState('');
  const [precioServicio, setPrecioServicio] = useState('');
  const [duracionServicio, setDuracionServicio] = useState('30');
  
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [busquedaProf, setBusquedaProf] = useState('');
  
  // Modal de búsqueda de profesional por correo
  const [modalBarberosOpen, setModalBarberosOpen] = useState(false);
  const [correoBusqueda, setCorreoBusqueda] = useState('');
  const [resultadoBusqueda, setResultadoBusqueda] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [msgBusqueda, setMsgBusqueda] = useState('');

  // Modal para confirmar desvinculación
  const [profesionalADesvincular, setProfesionalADesvincular] = useState(null);
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiadoLink, setCopiadoLink] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUser(user);
        try {
          const docRef = doc(db, 'establecimientos', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setEstablecimientoData(docSnap.data());
          } else {
            setEstablecimientoData({ nombre: 'Establecimiento Socio' });
          }
        } catch (err) {
          console.error("Error al cargar datos del establecimiento:", err);
        }
      } else {
        setAuthUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!authUser) return;

    // 1. Profesionales vinculados o pendientes
    const qVinculados = query(collection(db, 'profesionales'), where('establecimientoId', '==', authUser.uid));
    const unsubVinculados = onSnapshot(qVinculados, (snapshot) => {
      const lista = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.estadoVinculacion !== 'rechazado') {
          lista.push({ id: docSnap.id, ...data });
        }
      });
      setProfesionales(lista);
    });

    // 2. Citas en tiempo real
    const unsubCitas = onSnapshot(collection(db, 'citas'), (snapshot) => {
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

    // 3. Servicios del establecimiento
    const qServicios = query(collection(db, 'servicios'), where('establecimientoId', '==', authUser.uid));
    const unsubServicios = onSnapshot(qServicios, (snapshot) => {
      const listaServ = [];
      snapshot.forEach(docSnap => {
        listaServ.push({ id: docSnap.id, ...docSnap.data() });
      });
      setServiciosEstablecimiento(listaServ);
    });

    return () => {
      unsubVinculados();
      unsubCitas();
      unsubServicios();
    };
  }, [authUser]);

  // Crear nuevo servicio
  const handleCrearServicio = async (e) => {
    e.preventDefault();
    if (!nombreServicio || !precioServicio) return;

    try {
      await addDoc(collection(db, 'servicios'), {
        nombre: nombreServicio,
        precio: Number(precioServicio),
        duracion: Number(duracionServicio) || 30,
        establecimientoId: authUser.uid,
        establecimientoNombre: establecimientoData?.nombre || 'Establecimiento',
        createdAt: new Date().toISOString()
      });
      setNombreServicio('');
      setPrecioServicio('');
      setSuccessMsg('¡Servicio creado exitosamente!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Error al crear servicio:", err);
      setErrorMsg('No se pudo crear el servicio.');
    }
  };

  // Eliminar servicio
  const handleEliminarServicio = async (idServicio) => {
    try {
      await deleteDoc(doc(db, 'servicios', idServicio));
      setSuccessMsg('Servicio eliminado.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Error al eliminar servicio:", err);
      setErrorMsg('No se pudo eliminar el servicio.');
    }
  };

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
      
      {/* MENÚ LATERAL IZQUIERDO (Iconos que se despliegan al pasar el mouse) */}
      <aside className="group fixed left-0 top-0 h-screen w-16 hover:w-56 bg-white/95 border-r border-blue-200 backdrop-blur-md flex flex-col justify-between py-5 z-50 transition-all duration-300 shadow-[4px_0_20px_rgba(37,99,235,0.06)] overflow-hidden">
        
        {/* Logo / Parte superior */}
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

        {/* Opciones de Navegación */}
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
            onClick={() => {
              setSeccionActiva('agenda');
              setModalBarberosOpen(true);
            }}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer text-slate-600 hover:bg-blue-50 hover:text-blue-600"
          >
            <UserPlus className="w-5 h-5 shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold text-xs uppercase tracking-wider whitespace-nowrap">
              Vincular Profesional
            </span>
          </button>

        </nav>

        {/* Pie del Menú (Cerrar Sesión) */}
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

      {/* CONTENEDOR GENERAL CON MARGEN IZQUIERDO PARA EL MENÚ RETRÁCTIL */}
      <div className="flex-1 ml-16 flex flex-col justify-between min-h-screen">
        
        {/* Header Superior */}
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
            {/* Sección de enlace para clientes */}
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

        {/* Contenido Dinámico según la Sección Activa */}
        <main className="flex-1 p-6 max-w-[1700px] mx-auto w-full space-y-4">
          
          {successMsg && <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] flex gap-1.5 items-center shadow-2xs"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{successMsg}</div>}
          {errorMsg && <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-[10px] flex gap-1.5 items-center shadow-2xs"><AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />{errorMsg}</div>}

          {/* ================= SECCIÓN: AGENDA MATRIZ ================= */}
          {seccionActiva === 'agenda' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Tarjetas de Métricas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-blue-50 via-sky-50/50 to-white border border-blue-200/80 p-3 rounded-xl flex items-center justify-between shadow-2xs">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Profesionales en Plantilla</p>
                    <p className="text-xl font-black text-blue-950">{profesionales.length}</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Users className="w-4 h-4" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 via-sky-50/50 to-white border border-blue-200/80 p-3 rounded-xl flex items-center justify-between shadow-2xs">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Citas Programadas (Hoy)</p>
                    <p className="text-xl font-black text-blue-950">{totalCitasHoy}</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 via-sky-50/50 to-white border border-blue-200/80 p-3 rounded-xl flex items-center justify-between shadow-2xs">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Servicios Activos</p>
                    <p className="text-xl font-black text-blue-950">{serviciosEstablecimiento.length}</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Scissors className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Panel de Controles y Filtros */}
              <div className="bg-white border border-blue-200/80 rounded-xl p-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                  <div className="relative w-full max-w-sm">
                    <Search className="w-3.5 h-3.5 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      placeholder="Buscar profesional en la agenda..."
                      value={busquedaProf}
                      onChange={(e) => setBusquedaProf(e.target.value)}
                      className="w-full bg-blue-50/50 border border-blue-200 rounded-lg pl-9 pr-3 py-1.5 text-[11px] text-slate-800 outline-none focus:border-blue-600 transition-all placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-blue-50/80 border border-blue-200 px-2.5 py-1 rounded-lg">
                    <span className="text-[10px] font-bold text-blue-900 uppercase">📅 Fecha:</span>
                    <input 
                      type="date" 
                      value={fechaStrActual} 
                      onChange={(e) => {
                        if (e.target.value) setFechaSeleccionada(new Date(e.target.value + 'T00:00:00'));
                      }}
                      className="bg-transparent text-[11px] font-bold text-blue-600 outline-none cursor-pointer"
                    />
                  </div>

                  <button 
                    onClick={() => setFechaSeleccionada(new Date())}
                    className="bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all shadow-2xs cursor-pointer active:scale-95"
                  >
                    Hoy
                  </button>
                </div>
              </div>

              {/* Matriz Visual de Agenda */}
              <div className="relative w-full flex flex-col select-none rounded-xl border border-blue-200 bg-white shadow-2xs overflow-hidden">
                {profesionalesFiltrados.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-[11px] space-y-2">
                    <Users className="w-10 h-10 mx-auto opacity-30 text-blue-500" />
                    <p className="font-bold text-slate-600">No hay profesionales vinculados actualmente.</p>
                    <p className="text-[9px] text-slate-400">Usa el menú lateral o el botón superior para vincular profesionales a tu agenda.</p>
                  </div>
                ) : (
                  <div className="relative w-full flex flex-col flex-1 overflow-y-auto overflow-x-auto max-h-[72vh]">
                    
                    <div className="sticky top-0 z-30 bg-blue-50/95 backdrop-blur-md shadow-2xs border-b-2 border-blue-300 grid"
                         style={{ gridTemplateColumns: `70px repeat(${profesionalesFiltrados.length}, minmax(190px, 1fr))` }}>
                      <div className="p-2 text-blue-700 font-bold text-[9px] border-r border-blue-200 bg-blue-100 flex items-center justify-center sticky left-0 z-40 uppercase">
                        Hora
                      </div>
                      {profesionalesFiltrados.map((prof) => {
                        const esPendiente = prof.estadoVinculacion === 'pendiente';
                        return (
                          <div key={prof.id} className={`p-2 border-r border-blue-200/70 last:border-r-0 flex items-center gap-2 ${esPendiente ? 'bg-amber-50/90' : 'bg-blue-50/95'}`}>
                            <button 
                              onClick={() => setProfesionalADesvincular(prof)}
                              className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-[10px] overflow-hidden shrink-0 shadow-2xs hover:scale-110 hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer relative group"
                              title="Clic para gestionar / desvincular profesional"
                            >
                              {prof.foto ? (
                                <img src={prof.foto} alt={prof.nombre} className="w-full h-full object-cover" />
                              ) : (
                                (prof.nombre || 'P').charAt(0).toUpperCase()
                              )}
                              <span className="absolute inset-0 bg-red-600/70 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] font-bold transition-opacity">
                                ✕
                              </span>
                            </button>
                            
                            <div className="truncate">
                              <p className="font-black text-slate-900 text-[11px] truncate leading-tight">{prof.nombre}</p>
                              <span className={`text-[8px] font-bold truncate block ${esPendiente ? 'text-amber-700 font-extrabold' : 'text-blue-700'}`}>
                                {esPendiente ? '⏳ Pendiente Aprobación' : (prof.especialidad || 'Profesional')}
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

                        return (
                          <div key={idx} className="grid items-stretch min-h-[56px] border-b border-blue-100 text-[10px] relative"
                               style={{ gridTemplateColumns: `70px repeat(${profesionalesFiltrados.length}, minmax(190px, 1fr))` }}>
                            
                            <div className="border-r border-blue-200 px-1.5 font-sans text-[9px] font-semibold text-blue-700 flex items-center justify-center text-center sticky left-0 z-20 bg-blue-50/95 shadow-[4px_0_10px_-2px_rgba(37,99,235,0.1)]">
                              <span>{itemHora.label.toLowerCase()}</span>
                            </div>

                            {profesionalesFiltrados.map((prof, pIdx) => {
                              const esPendiente = prof.estadoVinculacion === 'pendiente';

                              if (esPendiente) {
                                return (
                                  <div key={pIdx} className="border-r border-amber-200/60 last:border-r-0 p-1 bg-amber-50/40 flex items-center justify-center text-center">
                                    {idx === 2 && (
                                      <span className="text-[9px] font-extrabold text-amber-700 bg-amber-100/80 px-2 py-1 rounded-md border border-amber-300">
                                        Inhabilitado (Pendiente)
                                      </span>
                                    )}
                                  </div>
                                );
                              }

                              const citasEnEstaHora = citas.filter(c => {
                                const coincideBarbero = String(c.barberoId) === String(prof.id) || 
                                  (c.barberoName && prof.nombre && c.barberoName.toLowerCase().trim() === prof.nombre.toLowerCase().trim());
                                if (!coincideBarbero || c.fechaStr !== fechaStrActual || !c.hora) return false;
                                const minCita = horaAMinutos(c.hora);
                                return minCita >= minutosFilaInicio && minCita < minutosFilaFin;
                              });

                              return (
                                <div key={pIdx} className="border-r border-blue-100/60 last:border-r-0 p-0.5 relative flex flex-col gap-0.5 items-stretch hover:bg-blue-50/20 transition-colors">
                                  {citasEnEstaHora.length > 0 ? (
                                    citasEnEstaHora.map((cita, cIdx) => {
                                      const estadoCita = (cita.estado || '').toLowerCase();
                                      const esBloqueo = cita.esBloqueo || estadoCita === 'bloqueado';
                                      const esFinalizada = estadoCita === 'finalizada' || estadoCita === 'finalizado';

                                      let colorClase = 'bg-blue-50 border-blue-200 text-blue-950 font-semibold shadow-2xs';
                                      if (estadoCita === 'confirmada' || estadoCita === 'confirmado') colorClase = 'bg-emerald-50 border-emerald-200 text-emerald-950 font-semibold shadow-2xs';
                                      if (esFinalizada) colorClase = 'bg-slate-100 border-slate-200 text-slate-400 font-normal opacity-70';
                                      if (esBloqueo) colorClase = 'bg-rose-100 border-rose-300 text-rose-800 font-bold';

                                      return (
                                        <div 
                                          key={cIdx}
                                          className={`p-1.5 border rounded-lg flex flex-col justify-between ${colorClase} min-h-[42px]`}
                                        >
                                          <div className="flex justify-between items-center gap-1">
                                            <span className="font-bold truncate text-[9px]">
                                              {esBloqueo ? `🚫 ${cita.motivo || 'NO DISP.'}` : `👤 ${cita.cliente}`}
                                            </span>
                                            <span className="text-[8px] font-mono opacity-80 whitespace-nowrap">{cita.hora}</span>
                                          </div>
                                          {!esBloqueo && (
                                            <div className="flex justify-between items-end text-[8px] opacity-90 font-medium pt-0.5">
                                              <span className="truncate">✂️ {cita.servicio}</span>
                                              <span className="uppercase text-[7px] font-bold px-1 py-0.2 rounded bg-white/60 border border-black/5">{cita.estado}</span>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })
                                  ) : null}
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
          )}

          {/* ================= SECCIÓN: SERVICIOS ================= */}
          {seccionActiva === 'servicios' && (
            <Servicios />
          )}

        </main>
      </div>

      {/* Modal para Buscar por Correo y Vincular Profesional */}
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

      {/* Modal de Confirmación de Desvinculación */}
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

    </div>
  );
}