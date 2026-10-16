import React, { useState, useEffect } from 'react';
import { Plus, Wallet as WalletIcon, Calendar, Eye, Edit3, Trash2, Clock, User, Scissors, CheckCircle2, Percent, Layers, ChevronRight, AlertTriangle, X, Home, Edit2, EyeOff } from 'lucide-react';
import { db, auth } from '../../components/firebase'; 
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';

const Wallet = () => {
  const [vistaTab, setVistaTab] = useState('manual');

  const [filtroTiempo, setFiltroTiempo] = useState('dia');
  
  const obtenerFechaLocal = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [activeTab, setActiveTab] = useState('manual');
  const hoyStr = obtenerFechaLocal();
  const [fechaEspecifica, setFechaEspecifica] = useState(hoyStr);
  const [fechaInicio, setFechaInicio] = useState(hoyStr);
  const [fechaFin, setFechaFin] = useState(hoyStr);
  const [quincenaActivaModal, setQuincenaActivaModal] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [serviciosFirebase, setServiciosFirebase] = useState([]); // Catálogo de servicios internos
  const [citasFinalizadas, setCitasFinalizadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCitas, setLoadingCitas] = useState(false);
  const [guardando, setGuardando] = useState(false);
const [isOpenServicios, setIsOpenServicios] = useState(false);
  const [porcentajeBarbero, setPorcentajeBarbero] = useState(35);
  const [alertaExito, setAlertaExito] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('¡Guardado con éxito!');
  const [diaSeleccionadoModal, setDiaSeleccionadoModal] = useState(null);
  const [modalAgregarOpen, setModalAgregarOpen] = useState(false);
  const [modalVerMasOpen, setModalVerMasOpen] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
const [mostrarAlertaPerfil, setMostrarAlertaPerfil] = useState(false);
  const [modalDiaOpen, setModalDiaOpen] = useState(false);
  const [diaSeleccionadoDetalle, setDiaSeleccionadoDetalle] = useState(null);
const [modalServicioInternoOpen, setModalServicioInternoOpen] = useState(false);
const [nuevoServicioInterno, setNuevoServicioInterno] = useState({ nombre: '', precio: '', color: '#10b981' });
  const [modalCitaDetalleOpen, setModalCitaDetalleOpen] = useState(false);
  const [citaSeleccionadaDetalle, setCitaSeleccionadaDetalle] = useState(null);
const [exitoModalOpen, setExitoModalOpen] = useState(false);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [servicioAEliminar, setServicioAEliminar] = useState(null);
  const [barberData, setBarberData] = useState(null);
const [citasEstablecimiento, setCitasEstablecimiento] = useState([]);
  const [modalEgresosAbierto, setModalEgresosAbierto] = useState(false);
const [modalPropinasAbierto, setModalPropinasAbierto] = useState(false);

const [listaEgresos, setListaEgresos] = useState([]);
const [listaPropinas, setListaPropinas] = useState([]);

const [nuevoEgresoNombre, setNuevoEgresoNombre] = useState('');
const [nuevoEgresoMonto, setNuevoEgresoMonto] = useState('');
const [nuevaPropinaNota, setNuevaPropinaNota] = useState('');
const [nuevaPropinaMonto, setNuevaPropinaMonto] = useState('');
const [editandoEgresoId, setEditandoEgresoId] = useState(null);
const [editandoPropinaId, setEditandoPropinaId] = useState(null);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
const [errorMsg, setErrorMsg] = useState('');
  const [formEdicion, setFormEdicion] = useState({
    id: '',
    cliente: '',
    servicio: '',
    total: '',
    porcentajeBarberForm: '35',
    fecha: hoyStr,
    hora: ''
  });

  const [nuevoServicio, setNuevoServicio] = useState({
    cliente: '',
    servicio: '',
    total: '',
    porcentajeBarberForm: '',
    fecha: hoyStr,
    hora: new Date().toTimeString().slice(0, 5),
    serviciosSeleccionados: []
  });

  const [mostrarQ1, setMostrarQ1] = useState(false);
  const [mostrarQ2, setMostrarQ2] = useState(false);
  const [timerQ1, setTimerQ1] = useState(null);
  const [timerQ2, setTimerQ2] = useState(null);

  const handleToggleQ1 = (e) => {
    e.stopPropagation();
    if (mostrarQ1) {
      setMostrarQ1(false);
      if (timerQ1) clearTimeout(timerQ1);
    } else {
      setMostrarQ1(true);
      if (timerQ1) clearTimeout(timerQ1);
      const id = setTimeout(() => setMostrarQ1(false), 10000);
      setTimerQ1(id);
    }
  };

  // 1. Cálculo de los totales acumulados para los círculos
const totalEgresosCalculado = (listaEgresos || []).reduce(
  (acc, item) => acc + (Number(item.monto) || 0), 
  0
);

const totalPropinasCalculado = (listaPropinas || []).reduce(
  (acc, item) => acc + (Number(item.monto) || 0), 
  0
);

  const handleToggleQ2 = (e) => {
    e.stopPropagation();
    if (mostrarQ2) {
      setMostrarQ2(false);
      if (timerQ2) clearTimeout(timerQ2);
    } else {
      setMostrarQ2(true);
      if (timerQ2) clearTimeout(timerQ2);
      const id = setTimeout(() => setMostrarQ2(false), 10000);
      setTimerQ2(id);
    }
  };

  const valorTotalNum = parseFloat(nuevoServicio.total) || 0;
  const porcentajeNum = parseFloat(nuevoServicio.porcentajeBarberForm) || 0;
  const gananciaCalculadaEnVivo = (valorTotalNum * porcentajeNum) / 100;

  const valorEditTotalNum = parseFloat(formEdicion.total) || 0;
  const porcentajeEditNum = parseFloat(formEdicion.porcentajeBarberForm) || 0;
  const gananciaEditCalculadaEnVivo = (valorEditTotalNum * porcentajeEditNum) / 100;

  const obtenerServicios = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      const querySnapshot = await getDocs(collection(db, 'wallet'));
      const data = querySnapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data()
      }));
      
      const serviciosValidos = data.filter(item => {
        const esDelBarbero = user ? (item.barberId === user.uid || item.barberoId === user.uid) : true;
        return esDelBarbero && item.cliente && item.total !== undefined;
      });

      setServicios(serviciosValidos);
    } catch (error) {
      console.error("Error al conectar con la colección wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerServiciosDisponibles = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'servicios'));
      const data = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setServiciosFirebase(data);
    } catch (error) {
      console.error("Error al obtener servicios de Firebase:", error);
    }
  };
  

  const obtenerCitasFinalizadas = async () => {
    try {
      setLoadingCitas(true);
      const user = auth.currentUser;
      const querySnapshot = await getDocs(collection(db, 'citas'));
      const data = querySnapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data()
      }));

      const citasValidas = data.filter(item => {
        const esDelBarbero = user ? (item.barberoId === user.uid || item.barberId === user.uid || item.barberoid === user.uid) : true;
        const estadoCita = item.estado ? item.estado.toLowerCase().trim() : '';
        return esDelBarbero && (estadoCita === 'finalizado' || estadoCita === 'finalizada');
      });

      setCitasFinalizadas(citasValidas);
    } catch (error) {
      console.error("Error al conectar con la colección citas:", error);
    } finally {
      setLoadingCitas(false);
    }
  };
useEffect(() => {
    let unsubscribeServicios = null;
    let unsubscribeProfesional = null;
    let unsubscribeEgresos = null;
    let unsubscribePropinas = null;
    let unsubscribeCitasEstablecimiento = null; // 👈 Nuevo listener para citas

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log("Usuario autenticado UID:", user.uid);

        obtenerServicios();
        obtenerCitasFinalizadas();
        obtenerServiciosDisponibles();

        // 1. Listener para citas del establecimiento en tiempo real asignadas al barbero
        const qCitas = query(
          collection(db, "citas"), 
          where("barberoId", "==", user.uid)
        );

        unsubscribeCitasEstablecimiento = onSnapshot(qCitas, (snapshot) => {
          const listaCitas = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCitasEstablecimiento(listaCitas);
        });

        // 2. Listener para servicios internos
        const qServicios = query(
          collection(db, "servicios"), 
          where("barberoId", "==", user.uid)
        );

        unsubscribeServicios = onSnapshot(qServicios, (snapshot) => {
          const listaServicios = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setServiciosFirebase(listaServicios);
        });

        // 3. Listener para egresos en tiempo real
        const qEgresos = query(
          collection(db, "egresos"),
          where("barberoId", "==", user.uid)
        );
        unsubscribeEgresos = onSnapshot(qEgresos, (snapshot) => {
          const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setListaEgresos(lista);
        });

        // 4. Listener para propinas en tiempo real
        const qPropinas = query(
          collection(db, "propinas"),
          where("barberoId", "==", user.uid)
        );
        unsubscribePropinas = onSnapshot(qPropinas, (snapshot) => {
          const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setListaPropinas(lista);
        });

        // 5. Listener directo al documento del profesional
        const docRef = doc(db, "profesionales", user.uid);
        unsubscribeProfesional = onSnapshot(docRef, async (docSnap) => {
          if (docSnap.exists()) {
            const dataBarbero = docSnap.data();
            let infoBarbero = { ...dataBarbero };
            
            if (dataBarbero.establecimientoId) {
              try {
                const estabDocRef = doc(db, "establecimientos", dataBarbero.establecimientoId);
                const estabSnap = await getDoc(estabDocRef);
                if (estabSnap.exists()) {
                  const estabData = estabSnap.data();
                  infoBarbero.establecimientoNombre = estabData.nombre || estabData.nombreEstablecimiento || "Establecimiento Socio";
                }
              } catch (err) {
                console.error("Error al obtener nombre del establecimiento:", err);
              }
            }
            setBarberData(infoBarbero);
            
            const porcentajeFirestore = dataBarbero.porcentaje;
            if (porcentajeFirestore !== undefined && porcentajeFirestore !== null) {
              setNuevoServicio(prev => ({
                ...prev,
                porcentajeBarberForm: porcentajeFirestore
              }));
            }
          }
        });

      } else {
        if (unsubscribeServicios) unsubscribeServicios();
        if (unsubscribeProfesional) unsubscribeProfesional();
        if (unsubscribeEgresos) unsubscribeEgresos();
        if (unsubscribePropinas) unsubscribePropinas();
        if (unsubscribeCitasEstablecimiento) unsubscribeCitasEstablecimiento();
        setLoading(false);
        setLoadingCitas(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeServicios) unsubscribeServicios();
      if (unsubscribeProfesional) unsubscribeProfesional();
      if (unsubscribeEgresos) unsubscribeEgresos();
      if (unsubscribePropinas) unsubscribePropinas();
      if (unsubscribeCitasEstablecimiento) unsubscribeCitasEstablecimiento();
    };
  }, []);

  const parsearPrecioCita = (cita) => {
    const valorBruto = cita.precioTotal || cita.precio || cita.total || cita.costo || cita.valor;
    if (typeof valorBruto === 'number') return valorBruto;
    if (!valorBruto) return 0;
    const limpio = String(valorBruto).replace(/[^0-9]/g, '');
    return parseFloat(limpio) || 0;
  };

  

 const handleGuardarServicio = async (e) => {
    e.preventDefault();
    if (!nuevoServicio.cliente || !nuevoServicio.total) return;

    const user = auth.currentUser;
    if (!user) {
      alert("No hay una sesión activa.");
      return;
    }

    setGuardando(true);
    const totalVal = parseFloat(nuevoServicio.total);
    const porcentajeVal = parseFloat(nuevoServicio.porcentajeBarberForm) || 0;
    const gananciaVal = parseFloat(((totalVal * porcentajeVal) / 100).toFixed(2));

    const itemAEnviar = {
      barberId: user.uid, 
      barberEmail: user.email || '', 
      cliente: nuevoServicio.cliente.trim(),
      servicio: nuevoServicio.servicio.trim() || 'Servicio General',
      total: totalVal,
      ganancias: gananciaVal,
      porcentaje: true,
      porcentajeValor: porcentajeVal,
      fecha: nuevoServicio.fecha,
      hora: nuevoServicio.hora,
      createdAt: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(collection(db, 'wallet'), itemAEnviar);
      const itemConId = { id: docRef.id, ...itemAEnviar };
      
      setServicios([itemConId, ...servicios]);
      setNuevoServicio({
        cliente: '',
        servicio: '',
        serviciosSeleccionados: [],
        total: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toTimeString().slice(0, 5),
        porcentajeBarberForm: nuevoServicio.porcentajeBarberForm // Mantiene el porcentaje actual del perfil
      });
      // 1. Cerramos el modal primero
      setModalAgregarOpen(false);

      // 2. Limpiamos el formulario
      setNuevoServicio({ 
        cliente: '', 
        servicio: '', 
        total: '', 
        porcentajeBarberForm: porcentajeBarberoFirestore,
        fecha: hoyStr, 
        hora: new Date().toTimeString().slice(0, 5),
        serviciosSeleccionados: []
      });

      // 3. Activamos la alerta exclusiva de éxito
      setMensajeExito('¡Registro Exitoso!');
      setAlertaExito(true);
      setTimeout(() => setAlertaExito(false), 1000);

    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setGuardando(false);
    }
  };

  const ejecutarEliminacion = async () => {
    if (!servicioAEliminar) return;
    try {
      await deleteDoc(doc(db, 'wallet', servicioAEliminar.id));
      setServicios(servicios.filter(item => item.id !== servicioAEliminar.id));
      setModalEliminarOpen(false);
      setServicioAEliminar(null);
      setModalVerMasOpen(false);

      setMensajeExito('¡Registro eliminado!');
      setAlertaExito(true);
      setTimeout(() => setAlertaExito(false), 1000);
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const abrirModalEditar = (item) => {
    setFormEdicion({
      id: item.id,
      cliente: item.cliente || '',
      servicio: item.servicio || '',
      total: item.total ? String(item.total) : '',
      porcentajeBarberForm: item.porcentajeValor ? String(item.porcentajeValor) : '35',
      fecha: item.fecha || hoyStr,
      hora: item.hora || ''
    });
    setModalVerMasOpen(false);
    setModalEditarOpen(true);
  };

  const handleActualizarServicio = async (e) => {
    e.preventDefault();
    if (!formEdicion.cliente || !formEdicion.total) return;

    setGuardando(true);
    const totalVal = parseFloat(formEdicion.total);
    const porcentajeVal = parseFloat(formEdicion.porcentajeBarberForm) || 0;
    const gananciaVal = parseFloat(((totalVal * porcentajeVal) / 100).toFixed(2));

    const datosActualizados = {
      cliente: formEdicion.cliente.trim(),
      servicio: formEdicion.servicio.trim() || 'Servicio General',
      total: totalVal,
      ganancias: gananciaVal,
      porcentajeValor: porcentajeVal,
      fecha: formEdicion.fecha,
      hora: formEdicion.hora
    };

    try {
      const docRef = doc(db, 'wallet', formEdicion.id);
      await updateDoc(docRef, datosActualizados);

      setServicios(servicios.map(s => s.id === formEdicion.id ? { ...s, ...datosActualizados } : s));
      setModalEditarOpen(false);

      setMensajeExito('¡Actualizado con éxito!');
      setAlertaExito(true);
      setTimeout(() => setAlertaExito(false), 1000);
    } catch (error) {
      console.error("Error al actualizar:", error);
    } finally {
      setGuardando(false);
    }
  };

  const hoyObj = new Date();
  const anioActual = hoyObj.getFullYear();
  const mesActual = hoyObj.getMonth();
  const diaActual = hoyObj.getDate();
  const ultimoDiaMes = new Date(anioActual, mesActual + 1, 0).getDate();

  const esPrimeraQuincenaActiva = diaActual <= 15;

  const filtrarServiciosPorTiempo = (lista) => {
    return lista.filter(item => {
      if (!item.fecha) return false;
      const fechaItem = new Date(item.fecha + 'T00:00:00');
      
      if (filtroTiempo === 'dia') return item.fecha === hoyStr;
      if (filtroTiempo === 'especifico') return item.fecha === fechaEspecifica;
      if (filtroTiempo === 'rango') return item.fecha >= fechaInicio && item.fecha <= fechaFin;
      if (filtroTiempo === 'semana') {
        const primerDiaSemana = new Date(hoyObj);
        primerDiaSemana.setDate(hoyObj.getDate() - hoyObj.getDay());
        return fechaItem >= primerDiaSemana && fechaItem <= hoyObj;
      } 
      if (filtroTiempo === 'quincena') {
        const inicio = new Date(anioActual, mesActual, esPrimeraQuincenaActiva ? 1 : 16);
        const fin = new Date(anioActual, mesActual + 1, esPrimeraQuincenaActiva ? 16 : 0);
        return fechaItem >= inicio && fechaItem <= fin;
      } 
      if (filtroTiempo === 'mes') return fechaItem.getMonth() === mesActual && fechaItem.getFullYear() === anioActual;
      if (filtroTiempo === 'anio') return fechaItem.getFullYear() === anioActual;
      return true;
    });
  };

  // Combinamos los servicios manuales de la wallet con las citas que vienen del establecimiento
 // Combinamos los servicios manuales con las citas del establecimiento
  const citasComoServicios = (citasEstablecimiento || []).map(c => ({
    id: c.id,
    cliente: c.clienteNombre,
    servicio: c.servicio,
    total: c.precioTotal,
    ganancias: c.valorComision,
    porcentajeValor: c.comisionPorcentaje,
    fecha: c.fecha,
    hora: c.hora || '00:00',
    esDeEstablecimiento: true
  }));

  const todosLosIngresos = [...servicios, ...citasComoServicios];


  // Filtramos usando tu misma lógica de tiempo con la lista unida
  const serviciosFiltrados = filtrarServiciosPorTiempo(todosLosIngresos);
  
  const totalWallet = serviciosFiltrados.reduce((acc, item) => acc + (Number(item.total) || 0), 0);
  
  const gananciaBarbero = serviciosFiltrados.reduce((acc, item) => {
    const gananciaItem = item.ganancias !== undefined ? Number(item.ganancias) : ((Number(item.total) || 0) * (Number(porcentajeBarbero) || 0) / 100);
    return acc + gananciaItem;
  }, 0);


  const citasFiltradas = filtrarServiciosPorTiempo(citasFinalizadas);
  const totalDomicilios100 = citasFiltradas.reduce((acc, item) => acc + parsearPrecioCita(item), 0);

  const obtenerDiasAgrupadosDomicilios = () => {
    const diasMap = {};
    citasFiltradas.forEach(item => {
      const fecha = item.fecha || hoyStr;
      if (!diasMap[fecha]) {
        diasMap[fecha] = { fecha, totalCaja: 0, citas: [] };
      }
      const t = parsearPrecioCita(item);
      diasMap[fecha].totalCaja += t;
      diasMap[fecha].citas.push(item);
    });

    return Object.values(diasMap).sort((a, b) => b.fecha.localeCompare(a.fecha));
  };

  const diasAgrupadosDomicilios = obtenerDiasAgrupadosDomicilios();

  const obtenerTextoFechaRecuadro = () => {
    switch (filtroTiempo) {
      case 'dia': return `Hoy (${hoyStr})`;
      case 'especifico': return `Día: ${fechaEspecifica}`;
      case 'rango': return `Del ${fechaInicio} al ${fechaFin}`;
      case 'semana': return 'Semana actual';
      case 'quincena': return esPrimeraQuincenaActiva ? '1ra Quincena (1 - 15)' : `2da Quincena (16 - ${ultimoDiaMes})`;
      case 'mes': return hoyObj.toLocaleString('es', { month: 'long', year: 'numeric' });
      case 'anio': return `Año ${anioActual}`;
      default: return hoyStr;
    }
  };

  return (
    <div className="p-2 sm:p-4 bg-slate-50 text-slate-800 min-h-screen max-w-4xl mx-auto relative font-sans">
      
      {alertaExito && (
        <div className="fixed top-3 right-3 z-50 animate-bounce">
          <div className="bg-white border border-blue-300 text-slate-800 px-3 py-2 rounded-xl shadow-xl flex items-center gap-2 text-xs">
            <CheckCircle2 size={16} className="text-blue-600" />
            <p className="font-bold text-blue-700 text-[11px]">{mensajeExito}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-3 px-1">
        <div>
          <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
            <WalletIcon className="text-blue-600" size={20} /> 
            Billetera y Gestión
          </h1>
          <p className="text-slate-500 text-[10px] sm:text-xs">Control de porcentajes.</p>
        </div>
       {/* Etiqueta de Establecimiento Administrador compacta */}


        {vistaTab === 'manual' && (
        barberData?.establecimientoId ? (
            /* Etiqueta compacta que reemplaza al botón cuando está administrado */
            <div className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-md text-[9px] font-bold shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span className="truncate max-w-[220px]">
                Admin: <strong className="text-emerald-900">{barberData.establecimientoNombre || 'Establecimiento Socio'}</strong>
              </span>
            </div>
          ) : (
            /* Botón de Registrar original que aparece solo si no está vinculado */
            <button
              onClick={() => setModalAgregarOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-sm text-xs cursor-pointer"
            >
              <Plus size={15} /> Registrar
            </button>
          )
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={() => setVistaTab('manual')}
          className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
            vistaTab === 'manual'
              ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Percent size={14} /> Gestión Manual (%)
        </button>
{/* 
  <button
    onClick={() => setVistaTab('domicilios')}
    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
      vistaTab === 'domicilios'
        ? 'bg-blue-900 text-white border-blue-950 shadow-md'
        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
    }`}
  >
    <Home size={14} /> Domicilios 100% ({citasFinalizadas.length})
  </button>
*/}
      </div>

      {vistaTab === 'manual' && (() => {
       const obtenerDatosDiario = (diaInicio, diaFin) => {
          const dias = [];
          for (let d = diaInicio; d <= diaFin; d++) {
            // 👇 Aquí cambiamos 'servicios' por 'todosLosIngresos'
            const serviciosDia = todosLosIngresos.filter(s => {
              const rawFecha = s.fecha || s.date || s.createdAt || s.created_at;
              if (!rawFecha) return false;
              
              let dS = 0, mS = -1, aS = 0;
              if (typeof rawFecha === 'string') {
                const limpia = rawFecha.split('T')[0];
                if (limpia.includes('-')) {
                  const partes = limpia.split('-');
                  aS = parseInt(partes[0], 10);
                  mS = parseInt(partes[1], 10) - 1;
                  dS = parseInt(partes[2], 10);
                }
              }

              if (dS === 0) {
                const fechaObj = new Date(rawFecha);
                if (!isNaN(fechaObj.getTime())) {
                  aS = fechaObj.getFullYear();
                  mS = fechaObj.getMonth();
                  dS = fechaObj.getDate();
                }
              }

              return dS === d && mS === mesActual && aS === anioActual;
            });

            const totalDia = serviciosDia.reduce((acc, curr) => {
              const val = (curr.ganancias !== undefined && !isNaN(Number(curr.ganancias))) 
                ? Number(curr.ganancias) 
                : (Number(curr.total) || Number(curr.precio) || Number(curr.valor) || 0);
              return acc + val;
            }, 0);

            dias.push({ dia: d, monto: totalDia, serviciosCount: serviciosDia.length });
          }
          return dias;
        };

        const datosQ1 = obtenerDatosDiario(1, 15);
        const datosQ2 = obtenerDatosDiario(16, ultimoDiaMes);

        const totalRealQ1 = datosQ1.reduce((acc, curr) => acc + curr.monto, 0);
        const totalServiciosQ1 = datosQ1.reduce((acc, curr) => acc + curr.serviciosCount, 0);

        const totalRealQ2 = datosQ2.reduce((acc, curr) => acc + curr.monto, 0);
        const totalServiciosQ2 = datosQ2.reduce((acc, curr) => acc + curr.serviciosCount, 0);

        const generarPathYCoordenadas = (datos, width = 120, height = 26) => {
          const max = Math.max(...datos.map(d => d.monto), 1);
          
          const puntos = datos.map((item, idx) => {
            const x = datos.length > 1 ? (idx / (datos.length - 1)) * width : width / 2;
            const y = item.monto === 0 ? height - 4 : height - (item.monto / max) * (height - 10) - 5;
            return { x, y, ...item };
          });

          const pathD = puntos.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');
          const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;
          
          return { puntos, pathD, areaD, max };
        };

        const q1Grafico = generarPathYCoordenadas(datosQ1);
        const q2Grafico = generarPathYCoordenadas(datosQ2);

        return (
          <>
            <div className="grid grid-cols-2 gap-2 mb-3">
  {/* 1RA QUINCENA (1-15) */}
  <div 
    onClick={() => setQuincenaActivaModal({ titulo: '1ra Quincena (1-15)', datos: datosQ1, total: totalRealQ1, serv: totalServiciosQ1, grafico: q1Grafico })}
    className={`p-2.5 rounded-xl border transition-all relative overflow-hidden cursor-pointer hover:border-blue-500 hover:shadow-md ${esPrimeraQuincenaActiva ? 'bg-blue-50/90 border-blue-400 shadow-sm' : 'bg-white border-slate-200 opacity-80'}`}
  >
    <div className="flex justify-between items-center mb-1 relative z-10">
      <span className="text-[10px] font-bold tracking-wider uppercase text-blue-900 flex items-center gap-1">
        <Layers size={11} className="text-blue-600" /> 1ra Quincena (1-15)
      </span>
      {esPrimeraQuincenaActiva && <span className="inline-block w-2.5 h-2.5 bg-blue-600 rounded-full animate-ping shadow-sm"></span>}
    </div>
    
    <div className="h-7 w-full my-1 relative z-10 flex items-center">
      <svg viewBox="0 0 120 26" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="gradQ1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {q1Grafico?.areaD && <path d={q1Grafico.areaD} fill="url(#gradQ1)" />}
        {q1Grafico?.pathD && <path d={q1Grafico.pathD} fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />}
        {q1Grafico?.puntos?.map((pt, i) => (
          <circle key={i} cx={pt.x} cy={pt.y} r={pt.monto > 0 ? 3.5 : 1} className={pt.monto > 0 ? 'fill-blue-600 ring-2 ring-blue-200' : 'fill-blue-400/20'} />
        ))}
      </svg>
    </div>

    <div className="flex items-center justify-between relative z-10">
      <span className="text-xs text-slate-600 font-medium">{totalServiciosQ1} serv.</span>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-extrabold text-blue-950">
          {mostrarQ1 ? `$${totalRealQ1.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '••••••'}
        </span>
        <button 
          onClick={handleToggleQ1}
          className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-100/50 transition cursor-pointer"
          title={mostrarQ1 ? "Ocultar monto" : "Ver monto"}
        >
          {mostrarQ1 ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  </div>

  {/* 2DA QUINCENA (16-FIN) */}
  <div 
    onClick={() => setQuincenaActivaModal({ titulo: `2da Quincena (16-${ultimoDiaMes})`, datos: datosQ2, total: totalRealQ2, serv: totalServiciosQ2, grafico: q2Grafico })}
    className={`p-2.5 rounded-xl border transition-all relative overflow-hidden cursor-pointer hover:border-blue-500 hover:shadow-md ${!esPrimeraQuincenaActiva ? 'bg-blue-50/90 border-blue-400 shadow-sm' : 'bg-white border-slate-200 opacity-80'}`}
  >
    <div className="flex justify-between items-center mb-1 relative z-10">
      <span className="text-[10px] font-bold tracking-wider uppercase text-blue-900 flex items-center gap-1">
        <Layers size={11} className="text-blue-600" /> 2da Quincena (16-{ultimoDiaMes})
      </span>
      {/* Se reemplaza la etiqueta 'ACTUAL' por el mismo círculo intermitente de la 1ra quincena */}
      {!esPrimeraQuincenaActiva && <span className="inline-block w-2.5 h-2.5 bg-blue-600 rounded-full animate-ping shadow-sm"></span>}
    </div>

    <div className="h-7 w-full my-1 relative z-10 flex items-center">
      <svg viewBox="0 0 120 26" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="gradQ2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {q2Grafico?.areaD && <path d={q2Grafico.areaD} fill="url(#gradQ2)" />}
        {q2Grafico?.pathD && <path d={q2Grafico.pathD} fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />}
        {q2Grafico?.puntos?.map((pt, i) => (
          <circle key={i} cx={pt.x} cy={pt.y} r={pt.monto > 0 ? 3.5 : 1} className={pt.monto > 0 ? 'fill-blue-600 ring-2 ring-blue-200' : 'fill-blue-400/20'} />
        ))}
      </svg>
    </div>

    <div className="flex items-center justify-between relative z-10">
      <span className="text-xs text-slate-600 font-medium">{totalServiciosQ2} serv.</span>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-extrabold text-blue-950">
          {mostrarQ2 ? `$${totalRealQ2.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '••••••'}
        </span>
        <button 
          onClick={handleToggleQ2}
          className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-100/50 transition cursor-pointer"
          title={mostrarQ2 ? "Ocultar monto" : "Ver monto"}
        >
          {mostrarQ2 ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  </div>
</div>

      {quincenaActivaModal && (() => {
    const modalGrafico = generarPathYCoordenadas(quincenaActivaModal.datos, 300, 100);
    
    // Obtener la fecha actual para comparar los días en 0
    const hoy = new Date();
    const diaActual = hoy.getDate();
    const mesActualSistema = hoy.getMonth();
    const anioActualSistema = hoy.getFullYear();

    // Obtenemos la meta de manera segura buscando en las variables comunes del componente
    const valorMeta = Number(
      typeof metaDiaria !== 'undefined' ? metaDiaria : 
      (typeof barberData !== 'undefined' && barberData?.metaDiaria !== undefined ? barberData.metaDiaria : 
      (typeof establecimientoData !== 'undefined' ? establecimientoData?.metaDiaria : 
      (typeof authUser !== 'undefined' ? authUser?.metaDiaria : 0)))
    ) || 0;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fadeIn">
        <div className="bg-white border border-blue-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-slate-900 flex flex-col max-h-[90vh]">
          <div className="flex justify-between items-center px-5 py-4 border-b border-blue-100 bg-blue-50/50 flex-shrink-0">
            <div>
              <span className="text-xs font-bold tracking-wider text-blue-600 uppercase flex items-center gap-1.5">
                <Layers size={14} /> Análisis de Rendimiento
              </span>
              <h3 className="text-lg font-black text-blue-950">{quincenaActivaModal.titulo}</h3>
            </div>
            <button 
              onClick={() => {
                setQuincenaActivaModal(null);
                setDiaSeleccionadoModal(null);
              }}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors font-bold text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="p-5 overflow-y-auto space-y-5 flex-grow">
            <div className="flex justify-between items-center bg-blue-50/80 p-3.5 rounded-xl border border-blue-100">
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Producido</p>
                <p className="text-xl font-extrabold text-blue-600">${quincenaActivaModal.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-medium">Total Servicios</p>
                <p className="text-lg font-bold text-slate-800">{quincenaActivaModal.serv} serv.</p>
              </div>
            </div>

            {/* TARJETAS DE EGRESOS Y PROPINAS DE LA QUINCENA (CORREGIDO CON LISTAEGRESOS Y LISTAPROPINAS) */}
            {(() => {
              // Obtenemos los días que abarca esta quincena activa
              const diasQuincena = quincenaActivaModal.datos.map(d => d.dia);
              
              // Filtramos los egresos usando listaEgresos y validando fechaHora
              const egresosQuincena = (listaEgresos || []).filter(e => {
                const rawFecha = e.fechaHora || e.fecha || e.date || e.createdAt;
                if (!rawFecha) return false;
                const fechaObj = new Date(rawFecha);
                if (isNaN(fechaObj.getTime())) return false;
                return (
                  diasQuincena.includes(fechaObj.getDate()) &&
                  fechaObj.getMonth() === mesActual &&
                  fechaObj.getFullYear() === anioActual
                );
              });

              // Filtramos las propinas usando listaPropinas y validando fechaHora
              const propinasQuincena = (listaPropinas || []).filter(p => {
                const rawFecha = p.fechaHora || p.fecha || p.date || p.createdAt;
                if (!rawFecha) return false;
                const fechaObj = new Date(rawFecha);
                if (isNaN(fechaObj.getTime())) return false;
                return (
                  diasQuincena.includes(fechaObj.getDate()) &&
                  fechaObj.getMonth() === mesActual &&
                  fechaObj.getFullYear() === anioActual
                );
              });

              const totalEgresosQ = egresosQuincena.reduce((acc, curr) => acc + (Number(curr.monto || curr.valor || curr.total) || 0), 0);
              const totalPropinasQ = propinasQuincena.reduce((acc, curr) => acc + (Number(curr.monto || curr.valor || curr.total) || 0), 0);

              return (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-rose-50/70 border border-rose-100 p-3 rounded-xl">
                    <p className="text-[10px] text-rose-600 font-bold uppercase">Total Egresos</p>
                    <p className="text-base font-black text-rose-900 mt-0.5">${totalEgresosQ.toLocaleString()}</p>
                  </div>
                  <div className="bg-amber-50/70 border border-amber-100 p-3 rounded-xl">
                    <p className="text-[10px] text-amber-600 font-bold uppercase">Total Propinas</p>
                    <p className="text-base font-black text-amber-900 mt-0.5">${totalPropinasQ.toLocaleString()}</p>
                  </div>
                </div>
              );
            })()}

            {/* SVG del Gráfico con Línea de Meta y Globito */}
            <div className="h-32 w-full pt-4 relative">
              {(() => {
                const tieneMeta = valorMeta > 0;
                const maxMontoGrafico = Math.max(...modalGrafico.puntos.map(p => p.monto), valorMeta, 10000);
                const svgHeight = 100;
                const yMeta = svgHeight - (valorMeta / maxMontoGrafico) * (svgHeight - 15) - 10;

                return (
                  <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="modalGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* LÍNEA DE META VERDE */}
                    {tieneMeta && (
                      <g>
                        <line 
                          x1="0" 
                          y1={yMeta} 
                          x2="300" 
                          y2={yMeta} 
                          stroke="#10b981" 
                          strokeWidth="1.5" 
                          strokeDasharray="3,3" 
                        />
                        <foreignObject x="210" y={yMeta - 14} width="90" height="18" className="overflow-visible">
                          <div className="bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-xs text-center border border-emerald-400 whitespace-nowrap">
                            🎯 Meta: ${valorMeta.toLocaleString()}
                          </div>
                        </foreignObject>
                      </g>
                    )}

                    <path d={modalGrafico.areaD} fill="url(#modalGrad)" />
                    <path d={modalGrafico.pathD} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {modalGrafico.puntos.map((pt, i) => {
                      const itemDia = quincenaActivaModal.datos[i];
                      const esDiaPasado = itemDia && (
                        anioActual < anioActualSistema || 
                        (anioActual === anioActualSistema && mesActual < mesActualSistema) || 
                        (anioActual === anioActualSistema && mesActual === mesActualSistema && itemDia.dia < diaActual)
                      );
                      const esDescansoPt = itemDia && itemDia.monto === 0 && esDiaPasado;
                      const superaMeta = tieneMeta && itemDia && itemDia.monto >= valorMeta;

                      return (
                        <g key={i}>
                          <circle 
                            cx={pt.x} 
                            cy={pt.y} 
                            r={pt.monto > 0 ? 5 : (esDescansoPt ? 4 : 2)} 
                            className={
                              superaMeta 
                                ? 'fill-emerald-500 ring-4 ring-emerald-500/20' 
                                : pt.monto > 0 
                                  ? 'fill-cyan-400 ring-4 ring-cyan-500/20' 
                                  : esDescansoPt 
                                    ? 'fill-amber-500 ring-4 ring-amber-500/20' 
                                    : 'fill-slate-600'
                            } 
                          />
                        </g>
                      );
                    })}
                  </svg>
                );
              })()}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Desglose Día por Día</h4>
                <span className="text-[10px] text-blue-600 font-medium">Haz clic en un día para ver detalles</span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {quincenaActivaModal.datos.map((item, idx) => {
                  const esDiaPasado = (
                    anioActual < anioActualSistema || 
                    (anioActual === anioActualSistema && mesActual < mesActualSistema) || 
                    (anioActual === anioActualSistema && mesActual === mesActualSistema && item.dia < diaActual)
                  );
                  const esDescanso = item.monto === 0 && esDiaPasado;
                  const cumpleMeta = valorMeta > 0 && item.monto >= valorMeta;

                  return (
                    <div 
                      key={idx} 
                      onClick={() => setDiaSeleccionadoModal(item.dia)}
                      className={`flex justify-between items-center px-3 py-2.5 rounded-lg text-xs cursor-pointer transition-all border ${
                        cumpleMeta
                          ? 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-400 text-slate-900 font-medium shadow-2xs'
                          : item.monto > 0 
                            ? 'bg-blue-50/60 border-blue-200 hover:border-blue-400 hover:bg-blue-100/60 text-slate-900 font-medium shadow-2xs' 
                            : esDescanso
                              ? 'bg-amber-50/80 border-amber-200 hover:bg-amber-100/80 text-amber-900'
                              : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          cumpleMeta
                            ? 'bg-emerald-500'
                            : item.monto > 0 
                              ? 'bg-blue-600' 
                              : esDescanso 
                                ? 'bg-amber-500' 
                                : 'bg-slate-300'
                        }`}></span>
                        <span>Día {item.dia}</span>
                        {cumpleMeta && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.2 rounded-md">
                            🌟 ¡Meta cumplida!
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-3">
                        {!esDescanso && (
                          <span className="text-[11px] text-slate-500">{item.serviciosCount} serv.</span>
                        )}
                        <span className={`font-bold ${
                          cumpleMeta
                            ? 'text-emerald-700'
                            : item.monto > 0 
                              ? 'text-blue-600' 
                              : esDescanso 
                                ? 'text-amber-600 uppercase tracking-wide text-[10px] bg-amber-100 px-2 py-0.5 rounded-md font-extrabold' 
                                : 'text-slate-400'
                        }`}>
                          {esDescanso ? 'DESCANSO' : `$${item.monto.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-blue-100 bg-blue-50/50 text-right flex-shrink-0">
            <button 
              onClick={() => {
                setQuincenaActivaModal(null);
                setDiaSeleccionadoModal(null);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Cerrar Análisis
            </button>
          </div>
        </div>

        {/* Modal de Detalle de Día */}
        {diaSeleccionadoModal !== null && (() => {
          const serviciosDelDia = diaSeleccionadoModal !== null ? todosLosIngresos.filter(s => {
            const rawFecha = s.fecha || s.date || s.createdAt || s.created_at;
            if (!rawFecha) return false;
            
            let dS = 0, mS = -1, aS = 0;
            if (typeof rawFecha === 'string') {
              const limpia = rawFecha.split('T')[0];
              if (limpia.includes('-')) {
                const partes = limpia.split('-');
                aS = parseInt(partes[0], 10);
                mS = parseInt(partes[1], 10) - 1;
                dS = parseInt(partes[2], 10);
              }
            }
            if (dS === 0) {
              const fechaObj = new Date(rawFecha);
              if (!isNaN(fechaObj.getTime())) {
                aS = fechaObj.getFullYear();
                mS = fechaObj.getMonth();
                dS = fechaObj.getDate();
              }
            }
            return dS === diaSeleccionadoModal && mS === mesActual && aS === anioActual;
          }) : [];

          const totalGananciasDia = serviciosDelDia.reduce((acc, curr) => {
            const val = (curr.ganancias !== undefined && !isNaN(Number(curr.ganancias))) 
              ? Number(curr.ganancias) 
              : (Number(curr.total) || Number(curr.precio) || Number(curr.valor) || 0);
            return acc + val;
          }, 0);

          return (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
              <div className="bg-white border border-blue-300 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-900 flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center px-5 py-4 border-b border-blue-100 bg-blue-600 text-white">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-blue-100 uppercase">
                      Detalle de Caja
                    </span>
                    <h3 className="text-base font-black text-white">Servicios del Día {diaSeleccionadoModal}</h3>
                  </div>
                  <button 
                    onClick={() => setDiaSeleccionadoModal(null)}
                    className="w-8 h-8 rounded-full bg-blue-700 hover:bg-blue-800 flex items-center justify-center text-white transition-colors font-bold text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-5 overflow-y-auto space-y-3 flex-grow">
                  <div className="flex justify-between items-center bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100 text-xs">
                    <span className="text-slate-600">Total servicios: <strong className="text-slate-900">{serviciosDelDia.length}</strong></span>
                    <span className="text-slate-600">Ganancias: <strong className="text-blue-600">${totalGananciasDia.toLocaleString()}</strong></span>
                  </div>

                  {serviciosDelDia.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      No hay servicios registrados para este día.
                    </div>
                  ) : (
                    serviciosDelDia.map((srv, i) => {
                      const gananciaServicio = Number(srv.ganancias) || Number(srv.total) || 0;
                      const totalServicio = Number(srv.total) || 0;
                      const esAutomatico = Boolean(srv.esDeEstablecimiento);

                      return (
                        <div 
                          key={i} 
                          className={`border p-3.5 rounded-xl space-y-2 transition-all ${
                            esAutomatico 
                              ? 'bg-emerald-50/40 border-emerald-300 hover:border-emerald-500' 
                              : 'bg-slate-50 border-slate-200 hover:border-blue-400'       
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                <span className={`text-xs font-bold block ${esAutomatico ? 'text-emerald-950' : 'text-blue-900'}`}>
                                  {srv.servicio || 'Servicio sin nombre'}
                                </span>
                                
                                {esAutomatico ? (
                                  <span className="bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                                    Automático 🏢
                                  </span>
                                ) : (
                                  <span className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                                    Manual ✍️
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-600 font-medium">Cliente: {srv.cliente || 'General'}</span>
                            </div>

                            <div className="text-right">
                              <span className={`text-xs font-extrabold block ${esAutomatico ? 'text-emerald-700' : 'text-blue-600'}`}>
                                +${gananciaServicio.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-slate-400">Total: ${totalServicio.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-200 pt-2 font-mono">
                            <span>Hora: {srv.hora || 'N/A'}</span>
                            {srv.porcentajeValor && <span>Comisión: {srv.porcentajeValor}%</span>}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-3.5 border-t border-slate-100 bg-slate-50 text-right">
                  <button 
                    onClick={() => setDiaSeleccionadoModal(null)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Volver al Resumen
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    );
  })()}
          </>
        );
      })()}

      <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3 scrollbar-none">
        {[
          { id: 'dia', label: 'Hoy' },
          { id: 'especifico', label: 'Día' },
          { id: 'rango', label: 'Rango' },
          { id: 'semana', label: 'Semana' },
          { id: 'quincena', label: 'Quincena' },
          { id: 'mes', label: 'Mes' },
          { id: 'anio', label: 'Año' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFiltroTiempo(tab.id)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
              filtroTiempo === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtroTiempo === 'especifico' && (
        <div className="p-2.5 rounded-xl mb-3 flex items-center justify-between gap-2 text-[11px] border bg-blue-50 border-blue-200 text-blue-950">
          <span className="font-semibold flex items-center gap-1">
            <Calendar size={13} className="text-blue-600" /> Día a consultar:
          </span>
          <input
            type="date"
            value={fechaEspecifica}
            onChange={(e) => setFechaEspecifica(e.target.value)}
            className="bg-white rounded-lg px-2 py-1 text-slate-800 focus:outline-none font-medium border border-blue-300"
          />
        </div>
      )}

      {filtroTiempo === 'rango' && (
        <div className="p-2.5 rounded-xl mb-3 grid grid-cols-2 gap-2 text-[11px] border bg-blue-50 border-blue-200 text-blue-950">
          <div>
            <label className="block font-semibold mb-1">Desde:</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800 focus:outline-none font-medium"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Hasta:</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800 focus:outline-none font-medium"
            />
          </div>
        </div>
      )}
{vistaTab === 'manual' ? (() => {
  const [modalMetaAbierto, setModalMetaAbierto] = React.useState(false);
  const [inputMetaValor, setInputMetaValor] = React.useState('');

  const tieneMetaDefinida = barberData?.metaDiaria !== undefined && barberData?.metaDiaria !== null && barberData?.metaDiaria !== '';
  const metaActual = tieneMetaDefinida ? Number(barberData.metaDiaria) : 150000;

  // 1. CÁLCULO EXCLUSIVO PARA EL DÍA ACTUAL (Para la meta y el mensaje de Faltan / Sobre la meta)
  const gananciaDiaActual = todosLosIngresos
    .filter(s => {
      const rawFecha = s.fecha || s.date || s.createdAt || s.created_at;
      if (!rawFecha) return false;
      return String(rawFecha).split('T')[0] === hoyStr;
    })
    .reduce((acc, item) => {
      const gananciaItem = item.ganancias !== undefined ? Number(item.ganancias) : ((Number(item.total) || 0) * (Number(porcentajeBarbero) || 0) / 100);
      return acc + gananciaItem;
    }, 0);

  const porcentajeProgreso = tieneMetaDefinida ? Math.min(100, Math.max(0, (gananciaDiaActual / metaActual) * 100)) : 0;
  const diferenciaMetaDiaActual = gananciaDiaActual - metaActual;

  // 2. CÁLCULO DE EGRESOS Y PROPINAS SEGÚN EL FILTRO DE TIEMPO SELECCIONADO (Para los círculos)
  const filtrarPorTiempoActual = (lista) => {
    return (lista || []).filter(item => {
      const rawFecha = item.fechaHora || item.fecha || item.date || item.createdAt;
      if (!rawFecha) return false;
      const fechaItemStr = String(rawFecha).split('T')[0];
      const fechaItemObj = new Date(rawFecha);
      if (isNaN(fechaItemObj.getTime())) return false;

      if (filtroTiempo === 'dia') return fechaItemStr === hoyStr;
      if (filtroTiempo === 'especifico') return fechaItemStr === fechaEspecifica;
      if (filtroTiempo === 'rango') return fechaItemStr >= fechaInicio && fechaItemStr <= fechaFin;
      if (filtroTiempo === 'semana') {
        const primerDiaSemana = new Date(hoyObj);
        primerDiaSemana.setDate(hoyObj.getDate() - hoyObj.getDay());
        return fechaItemObj >= primerDiaSemana && fechaItemObj <= hoyObj;
      } 
      if (filtroTiempo === 'quincena') {
        const inicio = new Date(anioActual, mesActual, esPrimeraQuincenaActiva ? 1 : 16);
        const fin = new Date(anioActual, mesActual + 1, esPrimeraQuincenaActiva ? 16 : 0);
        return fechaItemObj >= inicio && fechaItemObj <= fin;
      } 
      if (filtroTiempo === 'mes') return fechaItemObj.getMonth() === mesActual && fechaItemObj.getFullYear() === anioActual;
      if (filtroTiempo === 'anio') return fechaItemObj.getFullYear() === anioActual;
      return true;
    });
  };

  const totalEgresosPeriodo = filtrarPorTiempoActual(listaEgresos).reduce((acc, item) => acc + (Number(item.monto) || 0), 0);
  const totalPropinasPeriodo = filtrarPorTiempoActual(listaPropinas).reduce((acc, item) => acc + (Number(item.monto) || 0), 0);

  const obtenerMensajeDinamico = (porc, definida) => {
    if (!definida) return "⚠️ Establece tu meta";
    if (porc >= 100) return "¡Meta superada! 🚀";
    if (porc >= 75) return "¡Ya casi! 🔥";
    if (porc >= 40) return "¡A mitad de camino! 💪";
    return "¡Vas empezando! ⚡";
  };

  const guardarMetaDiaria = async (e) => {
    e.preventDefault();
    const parsedMeta = parseInt(inputMetaValor.replace(/[^0-9]/g, ''), 10);
    const idProf = barberData?.id || barberData?.uid;

    if (!isNaN(parsedMeta) && parsedMeta > 0 && idProf) {
      try {
        await updateDoc(doc(db, 'profesionales', idProf), { metaDiaria: parsedMeta });
        setModalMetaAbierto(false);
        alert('¡Meta diaria actualizada con éxito!');
      } catch (err) {
        console.error("Error al actualizar la meta:", err);
        alert('Error al guardar la meta en la base de datos.');
      }
    } else {
      alert('Por favor ingresa un monto válido.');
    }
  };

  const radio = 36;
  const circunferencia = 2 * Math.PI * radio;
  const desplazamientoStroke = circunferencia - (porcentajeProgreso / 100) * circunferencia;

  return (
    <>
     <div className="bg-gradient-to-br from-white via-sky-50/40 to-blue-50/60 border border-blue-200 p-3 rounded-xl mb-2.5 shadow-2xs relative overflow-hidden">
        
  {/* Cabecera compacta */}
  <div className="flex justify-between items-center gap-2 mb-2">
    <span className="text-slate-500 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 truncate">
      <Calendar size={11} className="text-blue-600 shrink-0" /> Ganancia Manual • <span className="text-slate-800 capitalize truncate">{obtenerTextoFechaRecuadro()}</span>
    </span>
    <button 
      type="button"
      onClick={() => {
        setInputMetaValor(tieneMetaDefinida ? metaActual.toString() : '');
        setModalMetaAbierto(true);
      }}
      className={`text-[8px] px-2 py-0.5 rounded-lg font-bold uppercase transition cursor-pointer shadow-2xs flex items-center gap-1 shrink-0 ${
        tieneMetaDefinida ? 'bg-blue-100 hover:bg-blue-200 text-blue-800' : 'bg-amber-100 hover:bg-amber-200 text-amber-800 animate-pulse'
      }`}
    >
      🎯 {tieneMetaDefinida ? `Meta: $${metaActual.toLocaleString()}` : 'Configurar Meta'}
    </button>
  </div>

  {/* Contenido Principal Compacto */}
  <div className="flex items-center justify-between gap-2 overflow-x-auto py-1">
    
    {/* Columna Izquierda: Ganancias y Estado */}
    <div className="space-y-0.5 flex-1 min-w-0">
      <div className="flex items-baseline gap-1">
        <h2 className="text-xl sm:text-2xl font-black text-blue-950 truncate">
          ${gananciaBarbero.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </h2>
        <span className="text-blue-700 font-bold text-[10px] shrink-0">COP</span>
      </div>

      <div className="text-[9px] font-bold">
        {!tieneMetaDefinida ? (
          <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block">
            ⚠️ Sin meta establecida
          </span>
        ) : diferenciaMetaDiaActual >= 0 ? (
          <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block truncate">
            🎉 +${diferenciaMetaDiaActual.toLocaleString()} sobre la meta (Hoy)
          </span>
        ) : (
          <span className="text-blue-600 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100 inline-block truncate">
            ⏳ Faltan ${Math.abs(diferenciaMetaDiaActual).toLocaleString()}
          </span>
        )}
      </div>

      <div className="text-[9px] text-slate-500 flex items-center gap-1 font-medium pt-0.5">
        <span>Caja total:</span>
        <span className="text-slate-800 font-bold">${totalWallet.toLocaleString()} COP</span>
      </div>
    </div>

    {/* Columna Derecha: Grupo de Círculos (Meta, Egresos, Propinas) */}
    <div className="flex items-center gap-2 shrink-0">
      
      {/* Círculo 1: Progreso / Meta (Basado en el día actual) */}
      <div 
        className="relative flex flex-col items-center cursor-pointer group" 
        onClick={() => {
          setInputMetaValor(tieneMetaDefinida ? metaActual.toString() : '');
          setModalMetaAbierto(true);
        }} 
        title="Haz clic para cambiar tu meta diaria"
      >
        <div className={`absolute -top-6 text-[7px] font-black px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap animate-bounce border ${
          !tieneMetaDefinida ? 'bg-amber-500 text-slate-950 border-amber-300' : 'bg-blue-600 text-white border-sky-300'
        }`}>
          {obtenerMensajeDinamico(porcentajeProgreso, tieneMetaDefinida)}
        </div>

        <div className="relative w-14 h-14 flex items-center justify-center mt-1">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r={radio} stroke="currentColor" strokeWidth="6" className="text-blue-100" fill="transparent" />
            <circle
              cx="40" cy="40" r={radio}
              stroke="url(#gradientAzul)"
              strokeWidth="6"
              strokeDasharray={circunferencia}
              strokeDashoffset={desplazamientoStroke}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="gradientAzul" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-black text-blue-950">{tieneMetaDefinida ? `${Math.round(porcentajeProgreso)}%` : '0%'}</span>
            <span className="text-[6px] font-bold text-slate-400 uppercase tracking-tighter">Meta Hoy</span>
          </div>
        </div>
      </div>

      {/* Círculo 2: Egresos (Rojo) - Total del período seleccionado */}
      <div 
        className="relative flex flex-col items-center cursor-pointer group" 
        onClick={() => setModalEgresosAbierto(true)}
        title="Gestionar Egresos"
      >
        <div className="absolute -top-6 text-[7px] font-black px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap animate-pulse bg-rose-600 text-white border border-rose-300">
          💸 Egresos
        </div>

        <div className="relative w-14 h-14 flex items-center justify-center mt-1">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r={radio} stroke="currentColor" strokeWidth="6" className="text-rose-100" fill="transparent" />
            <circle
              cx="40" cy="40" r={radio}
              stroke="url(#gradientRojo)"
              strokeWidth="6"
              strokeDasharray={circunferencia}
              strokeDashoffset="15"
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out group-hover:scale-105"
            />
            <defs>
              <linearGradient id="gradientRojo" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[8px] font-black text-rose-950">-${totalEgresosPeriodo || 0}</span>
            <span className="text-[6px] font-bold text-slate-400 uppercase tracking-tighter">Gastos</span>
          </div>
        </div>
      </div>

      {/* Círculo 3: Propinas (Verde) - Total del período seleccionado */}
      <div 
        className="relative flex flex-col items-center cursor-pointer group" 
        onClick={() => setModalPropinasAbierto(true)}
        title="Gestionar Propinas"
      >
        <div className="absolute -top-6 text-[7px] font-black px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap animate-bounce bg-emerald-600 text-white border border-emerald-300">
          ✨ Propinas
        </div>

        <div className="relative w-14 h-14 flex items-center justify-center mt-1">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r={radio} stroke="currentColor" strokeWidth="6" className="text-emerald-100" fill="transparent" />
            <circle
              cx="40" cy="40" r={radio}
              stroke="url(#gradientVerde)"
              strokeWidth="6"
              strokeDasharray={circunferencia}
              strokeDashoffset="15"
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out group-hover:scale-105"
            />
            <defs>
              <linearGradient id="gradientVerde" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[8px] font-black text-emerald-950">+${totalPropinasPeriodo || 0}</span>
            <span className="text-[6px] font-bold text-slate-400 uppercase tracking-tighter">Propinas</span>
          </div>
        </div>
      </div>

    </div>
</div>
</div>

      {/* Modal Interactivo para Configurar la Meta Diaria y Consejo Financiero */}
      {modalMetaAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-slate-800 font-mono">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-blue-950 uppercase flex items-center gap-1.5">
                🎯 Establecer Meta Diaria
              </h3>
              <button onClick={() => setModalMetaAbierto(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>

            {/* Consejo Financiero */}
            <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl text-[10px] text-blue-950 space-y-1">
              <p className="font-black uppercase tracking-wide text-blue-800">💡 Consejo Financiero:</p>
              <p className="leading-snug text-slate-600">
                Establecer metas diarias realistas y alcanzables te permite mantener un flujo de caja constante, evaluar tu rendimiento operativo y asegurar la rentabilidad de tus servicios a domicilio.
              </p>
            </div>

            <form onSubmit={guardarMetaDiaria} className="space-y-3 text-[10px]">
              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase text-[9px]">Nuevo Monto Objetivo (COP):</label>
                <input 
                  type="text" 
                  required
                  value={inputMetaValor}
                  onChange={(e) => setInputMetaValor(e.target.value)}
                  placeholder="Ej: 200000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setModalMetaAbierto(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl uppercase transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 rounded-xl uppercase shadow-md transition cursor-pointer"
                >
                  Guardar Meta
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
})() : (
        <div className="bg-gradient-to-br from-blue-950 to-blue-900 border border-blue-800 p-4 rounded-2xl mb-3 shadow-md text-white relative">
          <div className="flex justify-between items-center gap-2 mb-2">
            <span className="text-blue-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Home size={12} className="text-sky-400" /> Ingresos Domicilios 100% (Finalizados) • <span className="text-white capitalize">{obtenerTextoFechaRecuadro()}</span>
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-sky-300">
              ${totalDomicilios100.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h2>
            <span className="text-sky-200 font-bold text-xs">COP</span>
          </div>

          <div className="mt-1.5 text-[10px] text-blue-200 flex items-center gap-1 font-medium">
            <span>Total servicios a domicilio completados:</span>
            <span className="text-white font-bold">{citasFiltradas.length} citas</span>
          </div>
        </div>
      )}

      {vistaTab === 'manual' ? (
        <div className="bg-white border border-blue-200 rounded-2xl overflow-hidden shadow-sm text-slate-800">
          <div className="p-3 border-b border-blue-100 flex justify-between items-center bg-blue-50/50">
            <h3 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
              <Calendar size={14} className="text-blue-600" /> Historial de Servicios Manuales
            </h3>
            <span className="text-[10px] bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full font-extrabold border border-blue-200">
              {serviciosFiltrados.length} servicios registrados
            </span>
          </div>

          <div className="divide-y divide-blue-50 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="py-6 text-center text-blue-500 text-xs font-medium">Cargando datos...</div>
            ) : serviciosFiltrados && serviciosFiltrados.length > 0 ? (
              [...serviciosFiltrados]
                .sort((a, b) => {
                  const fechaA = new Date(`${a.fecha || '1970-01-01'}T${a.hora || '00:00'}`);
                  const fechaB = new Date(`${b.fecha || '1970-01-01'}T${b.hora || '00:00'}`);
                  return fechaB - fechaA;
                })
                .map((srv, index) => {
                  const gananciaServicio = Number(srv.ganancias) || Number(srv.total) || 0;
                  const totalServicio = Number(srv.total) || 0;

                  return (
                    <div 
                      key={srv.id || index}
                      className={`p-3 flex items-center justify-between transition-colors group ${
                        srv.esDeEstablecimiento 
                          ? 'bg-emerald-50/50 hover:bg-emerald-50/90 border-l-4 border-l-emerald-500' // Fondo verde sutil y borde si viene del negocio
                          : 'hover:bg-blue-50/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl flex-shrink-0 border ${
                          srv.esDeEstablecimiento 
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-300' 
                            : 'bg-blue-50 text-blue-600 border-blue-200'
                        }`}>
                          <Calendar size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-xs font-bold text-slate-900">{srv.cliente || 'General'}</p>
                            
                            {/* Etiqueta Automático para los que vienen del establecimiento */}
                            {srv.esDeEstablecimiento && (
                              <span className="bg-emerald-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-2xs tracking-wider uppercase">
                                Automático 🏢
                              </span>
                            )}
                          </div>

                          <p className="text-[7px] text-slate-600 font-medium">
                            Servicio: <span className={`font-semibold ${srv.esDeEstablecimiento ? 'text-emerald-800' : 'text-blue-700'}`}>
                              {srv.servicio || 'Servicio sin nombre'}
                            </span>
                          </p>

                          <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                            {srv.fecha || 'Fecha N/A'} • {srv.hora || 'Hora N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right flex-shrink-0">
                          <p className={`text-xs font-extrabold ${srv.esDeEstablecimiento ? 'text-emerald-700' : 'text-blue-600'}`}>
                            +${gananciaServicio.toLocaleString()} COP
                          </p>
                          <p className="text-[10px] text-slate-500">Total: ${totalServicio.toLocaleString()}</p>
                          
                          {srv.porcentajeValor && (
                            <span className={`inline-block mt-0.5 text-[9px] px-1.5 py-0.2 rounded font-medium border ${
                              srv.esDeEstablecimiento 
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {srv.porcentajeValor}%
                            </span>
                          )}
                        </div>

                        {/* Si es automático del negocio, ocultamos los botones de edición manual para mantener la integridad */}
                        {!srv.esDeEstablecimiento && (
                          <div className="flex items-center gap-1.5 border-l border-blue-100 pl-2.5">
                            <button 
                              onClick={() => abrirModalEditar(srv)}
                              title="Editar servicio"
                              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors border border-blue-200 cursor-pointer"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button 
                              onClick={() => {
                                setServicioAEliminar(srv);
                                setModalEliminarOpen(true);
                              }}
                              title="Eliminar servicio"
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors border border-rose-200 cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs font-medium">
                No hay servicios manuales registrados en este período.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-3 border-b border-blue-50 flex justify-between items-center bg-blue-50/50">
            <h3 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
              <Home size={14} className="text-blue-700" /> Domicilios con Estado Finalizado
            </h3>
            <span className="text-[10px] bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full font-extrabold border border-blue-200">
              {diasAgrupadosDomicilios.length} días activos
            </span>
          </div>

          <div className="divide-y divide-blue-50">
            {loadingCitas ? (
              <div className="py-8 text-center text-blue-400 text-xs font-medium">Buscando citas en la base de datos...</div>
            ) : diasAgrupadosDomicilios.length > 0 ? (
              diasAgrupadosDomicilios.map((grupo) => (
                <div key={grupo.fecha} className="p-3 hover:bg-slate-50/60 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                      <Calendar size={13} className="text-blue-700" /> {grupo.fecha}
                    </span>
                    <span className="text-xs font-extrabold text-blue-900 bg-sky-50 px-2 py-1 rounded-lg border border-sky-200">
                      Total 100%: ${grupo.totalCaja.toLocaleString()} COP
                    </span>
                  </div>

                  <div className="space-y-2 pl-1">
                    {grupo.citas.map((cita) => (
                      <div key={cita.id} className="bg-gradient-to-r from-blue-50/60 to-slate-50 border border-blue-100 p-3 rounded-xl text-xs flex justify-between items-center shadow-2xs">
                        <div>
                          <p className="font-bold text-blue-950 flex items-center gap-1.5">
                            <User size={12} className="text-blue-600" /> {cita.clienteNombre || cita.cliente || 'Cliente'}
                          </p>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            <span className="font-medium text-blue-900">{cita.servicio || 'Servicio a Domicilio'}</span> • <span className="text-blue-700 font-semibold">{cita.hora}</span>
                          </p>
                          {cita.direccion && (
                            <p className="text-[10px] text-blue-800 font-medium mt-1">📍 {cita.direccion}</p>
                          )}
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-md">
                              <CheckCircle2 size={10} /> Finalizado
                            </span>
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end gap-1">
                          <p className="text-xs font-extrabold text-blue-950">
                            ${parsearPrecioCita(cita).toLocaleString()} COP
                          </p>
                          <button
                            onClick={() => { setCitaSeleccionadaDetalle(cita); setModalCitaDetalleOpen(true); }}
                            className="px-2.5 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded-lg shadow-2xs text-[10px] flex items-center gap-1 font-medium transition-all cursor-pointer"
                          >
                            <Eye size={11} /> Ver más
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-slate-400 text-xs font-medium">
                No hay citas con estado <strong className="text-blue-900">finalizado</strong> registradas para este período.
              </div>
            )}
          </div>
        </div>
      )}

      {modalCitaDetalleOpen && citaSeleccionadaDetalle && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex justify-center items-center p-3 z-50">
          <div className="bg-white border border-blue-200 rounded-2xl p-4 max-w-xs w-full shadow-2xl">
            <h3 className="text-sm font-bold text-blue-950 mb-2.5 flex items-center gap-1.5">
              <Home size={15} className="text-blue-700" /> Detalle Cita Domicilio (100%)
            </h3>
            <div className="space-y-2 text-[11px] text-slate-700 mb-3.5 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
              <p><strong className="text-blue-900">Cliente:</strong> {citaSeleccionadaDetalle.clienteNombre || citaSeleccionadaDetalle.cliente}</p>
              <p><strong className="text-blue-900">Servicio:</strong> {citaSeleccionadaDetalle.servicio}</p>
              <p><strong className="text-blue-900">Dirección:</strong> {citaSeleccionadaDetalle.direccion || 'No especificada'}</p>
              <p><strong className="text-blue-900">Teléfono:</strong> {citaSeleccionadaDetalle.telefono || 'No especificado'}</p>
              <p><strong className="text-blue-900">Fecha y Hora:</strong> {citaSeleccionadaDetalle.fecha} - {citaSeleccionadaDetalle.hora}</p>
              <p><strong className="text-blue-900">Estado:</strong> <span className="text-emerald-700 font-bold uppercase">{citaSeleccionadaDetalle.estado}</span></p>
              <p className="pt-1 border-t border-blue-100"><strong className="text-blue-950">Valor Total (100%):</strong> <span className="text-blue-900 font-extrabold text-xs">${parsearPrecioCita(citaSeleccionadaDetalle).toLocaleString()} COP</span></p>
            </div>

            <button
              onClick={() => setModalCitaDetalleOpen(false)}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-2 rounded-xl transition-all text-xs shadow-sm cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {modalEliminarOpen && servicioAEliminar && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex justify-center items-center p-3 z-50">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-5 max-w-xs w-full shadow-2xl text-center">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center mx-auto mb-3 text-rose-500">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">¿Eliminar registro?</h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Estás a punto de eliminar el servicio de <strong className="text-rose-400">{servicioAEliminar.cliente}</strong> por <strong className="text-rose-400">${Number(servicioAEliminar.total).toLocaleString()}</strong>.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setModalEliminarOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2 rounded-xl text-xs border border-slate-700 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarEliminacion}
                className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold py-2 rounded-xl text-xs shadow-lg transition-all cursor-pointer"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

   {/* Modal de Registro */}
{modalAgregarOpen && (
  <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex justify-center items-center p-3 z-50">
    <div className="bg-white border border-blue-200 rounded-2xl p-4 max-w-sm w-full shadow-2xl">
      <div className="flex justify-between items-center mb-2.5">
        <h3 className="text-sm font-bold text-slate-900">Registrar Nuevo Servicio</h3>
      </div>

      <form onSubmit={handleGuardarServicio} className="space-y-2.5 text-[11px]">
        <div>
          <label className="block font-medium text-slate-600 mb-0.5">Nombre del Cliente</label>
          <input
            type="text"
            required
            value={nuevoServicio.cliente}
            onChange={(e) => setNuevoServicio({ ...nuevoServicio, cliente: e.target.value })}
            placeholder="Ej. Carlos Pérez"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium text-slate-600 mb-0.5">Servicios Internos</label>
          <div className="relative mb-2">
            <div className="flex items-center gap-2">
              <div 
                onClick={() => setIsOpenServicios(!isOpenServicios)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 flex items-center justify-between cursor-pointer hover:border-blue-400 hover:shadow-sm transition-all duration-200"
              >
                <span className="text-sm text-slate-600 font-medium">Selecciona un servicio...</span>
                <svg 
                  className={`w-4 h-4 text-slate-400 transition-transform duration-300 ease-out ${isOpenServicios ? 'rotate-180 text-blue-600' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpenServicios(false);
                  setModalServicioInternoOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shadow-sm transition-all cursor-pointer shrink-0 z-20"
                title="Registrar nuevo servicio interno"
              >
                +
              </button>
            </div>

            {isOpenServicios && (
              <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200 p-1.5 space-y-1">
                {Array.isArray(serviciosFirebase) && serviciosFirebase.length > 0 ? (
                  serviciosFirebase
                    .filter(serv => {
                      const duracion = serv.duracion ? String(serv.duracion).toLowerCase().trim() : '';
                      const esInterno = duracion === 'interno';
                      const idDelBarberoActual = auth.currentUser?.uid; 
                      const esDelBarbero = String(serv.barberoId || serv.barberId || serv.barberoid) === String(idDelBarberoActual);
                      return esInterno && esDelBarbero;
                    })
                    .sort((a, b) => {
                      const precioA = parseFloat(String(a.precio || a.total || 0).replace(/[^0-9.-]+/g,"")) || 0;
                      const precioB = parseFloat(String(b.precio || b.total || 0).replace(/[^0-9.-]+/g,"")) || 0;
                      return precioA - precioB;
                    })
                    .map(serv => {
                      const colorServicio = serv.color || serv.colorHex || '#3b82f6';
                      return (
                        <div
                          key={serv.id}
                          onClick={() => {
                            const servicioId = serv.id;
                            const yaSeleccionado = (nuevoServicio.serviciosSeleccionados || []).some(s => s.id === servicioId);
                            
                            if (!yaSeleccionado) {
                              const nuevosSeleccionados = [...(nuevoServicio.serviciosSeleccionados || []), serv];
                              const nuevoTotal = nuevosSeleccionados.reduce((acc, curr) => {
                                const precioLimpiado = parseFloat(String(curr.precio || curr.total || 0).replace(/[^0-9.-]+/g,"")) || 0;
                                return acc + precioLimpiado;
                              }, 0);
                              const nombresConcatenados = nuevosSeleccionados.map(s => s.nombre || s.servicio).join(' + ');

                              setNuevoServicio({
                                ...nuevoServicio,
                                serviciosSeleccionados: nuevosSeleccionados,
                                servicio: nombresConcatenados,
                                total: nuevoTotal
                              });
                            }
                            setIsOpenServicios(false);
                          }}
                          style={{ backgroundColor: `${colorServicio}15`, borderColor: `${colorServicio}40` }}
                          className="flex items-center justify-between px-3.5 py-2.5 rounded-lg border cursor-pointer active:scale-[0.98] transition-all duration-150 group hover:shadow-sm"
                        >
                          <span className="font-semibold text-slate-800 text-sm group-hover:translate-x-0.5 transition-transform">
                            {serv.nombre || serv.servicio}
                          </span>
                          <span className="font-bold text-xs px-2.5 py-1 rounded-md text-white shadow-sm" style={{ backgroundColor: colorServicio }}>
                            ${serv.precio || serv.total}
                          </span>
                        </div>
                      );
                    })
                ) : (
                  <div className="py-4 text-center text-slate-400 text-xs">
                    No hay servicios internos registrados.
                  </div>
                )}
              </div>
            )}
          </div>

          {nuevoServicio.serviciosSeleccionados && nuevoServicio.serviciosSeleccionados.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-1">
              {nuevoServicio.serviciosSeleccionados.map((s, index) => (
                <span key={s.id || index} className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-md font-medium text-[10px]">
                  {s.nombre || s.servicio} (${s.precio || s.total})
                  <button
                    type="button"
                    onClick={() => {
                      const nuevosSeleccionados = nuevoServicio.serviciosSeleccionados.filter((_, i) => i !== index);
                      const nuevoTotal = nuevosSeleccionados.reduce((acc, curr) => {
                        const precioLimpiado = parseFloat(String(curr.precio || curr.total || 0).replace(/[^0-9.-]+/g,"")) || 0;
                        return acc + precioLimpiado;
                      }, 0);
                      const nombresConcatenados = nuevosSeleccionados.map(item => item.nombre || item.servicio).join(' + ');

                      setNuevoServicio({
                        ...nuevoServicio,
                        serviciosSeleccionados: nuevosSeleccionados,
                        servicio: nombresConcatenados,
                        total: nuevoTotal
                      });
                    }}
                    className="hover:text-rose-600 font-bold ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block font-medium text-slate-600 mb-0.5">Total (COP)</label>
            <input
              type="number"
              required
              value={nuevoServicio.total}
              onChange={(e) => setNuevoServicio({ ...nuevoServicio, total: e.target.value })}
              placeholder="Ej. 45000"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 font-bold text-blue-600"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-0.5">% Profesional</label>
            <input
              type="text"
              readOnly
              value={`${nuevoServicio.porcentajeBarberForm || 0}%`}
              onClick={() => setMostrarAlertaPerfil(true)}
              className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-500 font-bold cursor-pointer select-none transition-all hover:border-blue-400"
            />
            {mostrarAlertaPerfil && (
              <p className="text-[10px] text-blue-600 font-medium mt-1 animate-in fade-in duration-150 flex items-center justify-between">
                <span>💡 Para editar el %, ve a la sección de <strong>Perfil</strong>.</span>
                <button type="button" onClick={() => setMostrarAlertaPerfil(false)} className="text-slate-400 hover:text-slate-700 font-bold ml-2 cursor-pointer">✕</button>
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-600 mb-0.5">Ganancias (Calculado)</label>
          <input
            type="text"
            disabled
            value={`$${gananciaCalculadaEnVivo.toLocaleString(undefined, { maximumFractionDigits: 0 })} COP`}
            className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-blue-800 font-extrabold cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block font-medium text-slate-600 mb-0.5">Fecha</label>
            <input
              type="date"
              value={nuevoServicio.fecha}
              onChange={(e) => setNuevoServicio({ ...nuevoServicio, fecha: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-0.5">Hora</label>
            <input
              type="time"
              value={nuevoServicio.hora}
              onChange={(e) => setNuevoServicio({ ...nuevoServicio, hora: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-1.5">
          <button
            type="button"
            onClick={() => setModalAgregarOpen(false)}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-1.5 rounded-lg transition-all border border-slate-200 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-1.5 rounded-lg transition-all shadow-sm flex items-center justify-center cursor-pointer"
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{/* Alerta Central de Registro Exitoso con Estilos Visarka */}
{exitoModalOpen && (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center p-4 z-50 animate-in fade-in duration-200">
    <div className="bg-white border border-emerald-200 rounded-2xl p-5 max-w-xs w-full shadow-2xl text-center space-y-3 animate-in zoom-in-95 duration-200">
      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold shadow-inner">
        ✓
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-900">¡Registro Exitoso!</h4>
        <p className="text-xs text-slate-500 mt-1">El servicio se ha guardado correctamente.</p>
      </div>
    </div>
  </div>
)}

      {modalEditarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex justify-center items-center p-3 z-50">
          <div className="bg-white border border-blue-200 rounded-2xl p-4 max-w-xs w-full shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 mb-2.5">Editar Servicio</h3>
            <form onSubmit={handleActualizarServicio} className="space-y-2.5 text-[11px]">
              <div>
                <label className="block font-medium text-slate-600 mb-0.5">Nombre del Cliente</label>
                <input
                  type="text"
                  required
                  value={formEdicion.cliente}
                  onChange={(e) => setFormEdicion({ ...formEdicion, cliente: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-0.5">Descripción del Servicio</label>
                <input
                  type="text"
                  value={formEdicion.servicio}
                  onChange={(e) => setFormEdicion({ ...formEdicion, servicio: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-600 mb-0.5">Total (COP)</label>
                  <input
                    type="number"
                    required
                    value={formEdicion.total}
                    onChange={(e) => setFormEdicion({ ...formEdicion, total: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-0.5">% Barbero</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={formEdicion.porcentajeBarberForm}
                    onChange={(e) => setFormEdicion({ ...formEdicion, porcentajeBarberForm: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-0.5">Ganancias (Calculado)</label>
                <input
                  type="text"
                  disabled
                  value={`$${gananciaEditCalculadaEnVivo.toLocaleString(undefined, { maximumFractionDigits: 0 })} COP`}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-blue-800 font-extrabold cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-600 mb-0.5">Fecha</label>
                  <input
                    type="date"
                    value={formEdicion.fecha}
                    onChange={(e) => setFormEdicion({ ...formEdicion, fecha: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-0.5">Hora</label>
                  <input
                    type="time"
                    value={formEdicion.hora}
                    onChange={(e) => setFormEdicion({ ...formEdicion, hora: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={() => setModalEditarOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-1.5 rounded-lg transition-all border border-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-1.5 rounded-lg transition-all shadow-sm flex items-center justify-center cursor-pointer"
                >
                  {guardando ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalServicioInternoOpen && (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-end flex-col z-50 animate-in fade-in duration-200">
    {/* Contenedor con animación de deslizamiento de abajo hacia arriba */}
    <div className="bg-white border-t border-slate-200 rounded-t-3xl p-5 w-full max-w-lg mx-auto shadow-2xl animate-in slide-in-from-bottom duration-300">
      
      {/* Barra superior indicadora de arrastre */}
      <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4"></div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-bold text-slate-900">✨ Nuevo Servicio Interno</h3>
        <button 
          onClick={() => setModalServicioInternoOpen(false)}
          className="text-slate-400 hover:text-slate-600 font-bold text-lg px-2 cursor-pointer"
        >
          ✕
        </button>
      </div>

  {modalServicioInternoOpen && (
  <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm z-[9999] flex flex-col justify-end animate-in fade-in duration-200">
    {/* Contenedor del panel deslizante */}
    <div className="bg-white border-t border-slate-200 rounded-t-3xl p-5 w-full max-w-lg mx-auto shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
      
      {/* Barra superior indicadora */}
      <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4"></div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-bold text-slate-900">✨ Nuevo Servicio Interno</h3>
        <button 
          type="button"
          onClick={() => setModalServicioInternoOpen(false)}
          className="text-slate-400 hover:text-slate-600 font-bold text-lg px-2 cursor-pointer"
        >
          ✕
        </button>
      </div>

      <form 
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await addDoc(collection(db, "servicios"), {
              nombre: nuevoServicioInterno.nombre.toUpperCase(),
              precio: String(nuevoServicioInterno.precio),
              color: nuevoServicioInterno.color,
              duracion: "interno",
              categoria: "servicio",
              barberoId: auth.currentUser?.uid || ""
            });

            setModalServicioInternoOpen(false);
            setNuevoServicioInterno({ nombre: '', precio: '', color: '#3a87fe' });
          } catch (error) {
            console.error("Error al guardar el servicio interno en Firebase:", error);
          }
        }} 
        className="space-y-3 text-xs pb-4"
      >
        <div>
          <label className="block font-medium text-slate-600 mb-1">Nombre del Servicio</label>
          <input
            type="text"
            required
            value={nuevoServicioInterno.nombre}
            onChange={(e) => setNuevoServicioInterno({ ...nuevoServicioInterno, nombre: e.target.value })}
            placeholder="Ej. Corte Especial / Mantenimiento"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-500 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-600 mb-1">Precio (COP)</label>
            <input
              type="number"
              required
              value={nuevoServicioInterno.precio}
              onChange={(e) => setNuevoServicioInterno({ ...nuevoServicioInterno, precio: e.target.value })}
              placeholder="Ej. 20000"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-500 font-bold text-emerald-600 text-sm"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Color Distintivo</label>
            <input
              type="color"
              value={nuevoServicioInterno.color}
              onChange={(e) => setNuevoServicioInterno({ ...nuevoServicioInterno, color: e.target.value })}
              className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-1 py-1 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-3">
          <button
            type="button"
            onClick={() => setModalServicioInternoOpen(false)}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-xl transition-all border border-slate-200 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
          >
            Guardar Servicio
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  </div>
)}
{/* Alerta flotante con los estilos de Visarka */}
{mostrarAlertaPerfil && (
  <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
    <div className="flex items-center gap-2.5">
      <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
      <p className="text-xs font-medium">
        Para editar el porcentaje, dirígete a la sección de <strong className="text-blue-400">Perfil</strong>.
      </p>
    </div>
    <button 
      type="button"
      onClick={() => setMostrarAlertaPerfil(false)}
      className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
    >
      ×
    </button>
  </div>
)}

{/* Alerta central de éxito Visarka */}
{alertaExito && (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center p-4 z-[9999] animate-in fade-in duration-200">
    <div className="bg-white border border-emerald-200 rounded-2xl p-5 max-w-xs w-full shadow-2xl text-center space-y-3 animate-in zoom-in-95 duration-200">
      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold shadow-inner">
        ✓
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-900">{mensajeExito || '¡Registro Exitoso!'}</h4>
        <p className="text-xs text-slate-500 mt-1"></p>
      </div>
    </div>
  </div>
)}

{/* ================= MODAL EGRESOS ================= */}
{modalEgresosAbierto && (
  <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="text-xs font-black text-rose-600 uppercase flex items-center gap-1.5">
          💸 Gestión de Egresos
        </h3>
        <button 
          onClick={() => {
            setModalEgresosAbierto(false);
            setEditandoEgresoId(null);
            setNuevoEgresoNombre('');
            setNuevoEgresoMonto('');
          }} 
          className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Formulario para registrar / editar egreso */}
      <div className="bg-rose-50/50 border border-rose-100 p-3 rounded-xl space-y-2.5">
        <h4 className="text-[10px] font-black text-rose-900 uppercase">
          {editandoEgresoId ? '✏️ Editar Egreso' : 'Registrar Nuevo Egreso'}
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <input 
            type="text" 
            placeholder="Concepto (Ej: Insumos)" 
            value={nuevoEgresoNombre || ''} 
            onChange={e => setNuevoEgresoNombre(e.target.value)}
            className="bg-white border border-rose-200 rounded-xl p-2 text-[10px] text-slate-900 outline-none font-medium"
          />
          <input 
            type="number" 
            placeholder="Monto COP" 
            value={nuevoEgresoMonto || ''} 
            onChange={e => setNuevoEgresoMonto(e.target.value)}
            className="bg-white border border-rose-200 rounded-xl p-2 text-[10px] text-slate-900 outline-none font-medium"
          />
        </div>
        <div className="flex gap-2">
          {editandoEgresoId && (
            <button
              type="button"
              onClick={() => {
                setEditandoEgresoId(null);
                setNuevoEgresoNombre('');
                setNuevoEgresoMonto('');
              }}
              className="w-1/3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded-xl text-[10px] uppercase shadow-xs transition cursor-pointer"
            >
              Cancelar
            </button>
          )}
          <button
            type="button"
            onClick={async () => {
              if (!nuevoEgresoNombre || !nuevoEgresoMonto) {
                alert('Ingresa el concepto y el monto del egreso.');
                return;
              }
              try {
                if (editandoEgresoId) {
                  await updateDoc(doc(db, 'egresos', editandoEgresoId), {
                    nombre: nuevoEgresoNombre,
                    monto: Number(nuevoEgresoMonto)
                  });
                  alert('¡Egreso actualizado con éxito!');
                  setEditandoEgresoId(null);
                } else {
                  const currentUser = auth.currentUser;
  if (!currentUser) {
    alert('No hay una sesión activa.');
    return;
  }
           await addDoc(collection(db, 'egresos'), {
    barberoId: currentUser.uid, // ✅ Corregido
    nombre: nuevoEgresoNombre,
    monto: Number(nuevoEgresoMonto),
    fechaHora: new Date().toISOString()
  });
  alert('¡Egreso guardado con éxito!');
                  alert('¡Egreso guardado con éxito!');
                }
                setNuevoEgresoNombre('');
                setNuevoEgresoMonto('');
              } catch (err) {
                console.error(err);
                alert('Error al guardar el egreso.');
              }
            }}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-xl text-[10px] uppercase shadow-xs transition cursor-pointer"
          >
            {editandoEgresoId ? 'Actualizar Egreso' : 'Guardar Egreso'}
          </button>
        </div>
      </div>

      {/* Historial de Egresos con Acciones */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-black text-slate-700 uppercase">Historial de Egresos</h4>
        <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-[10px]">
            <thead className="bg-slate-50 text-slate-500 uppercase sticky top-0">
              <tr>
                <th className="p-2">Concepto</th>
                <th className="p-2">Monto</th>
                <th className="p-2">Fecha / Hora</th>
                <th className="p-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listaEgresos && listaEgresos.length > 0 ? (
                listaEgresos.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-2 font-bold text-slate-800">{item.nombre}</td>
                    <td className="p-2 text-rose-600 font-black">-${Number(item.monto || 0).toLocaleString()}</td>
                    <td className="p-2 text-slate-400">{item.fechaHora ? new Date(item.fechaHora).toLocaleString() : 'N/A'}</td>
                    <td className="p-2 flex items-center justify-center gap-1.5">
                      <button 
                        type="button"
                        onClick={() => {
                          setEditandoEgresoId(item.id);
                          setNuevoEgresoNombre(item.nombre);
                          setNuevoEgresoMonto(item.monto);
                        }}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-2 py-1 rounded-lg font-bold cursor-pointer"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        type="button"
                        onClick={async () => {
                          if (window.confirm('¿Estás seguro de eliminar este egreso?')) {
                            try {
                              await deleteDoc(doc(db, 'egresos', item.id));
                              alert('Egreso eliminado');
                            } catch (err) {
                              console.error(err);
                              alert('Error al eliminar');
                            }
                          }
                        }}
                        className="bg-rose-100 hover:bg-rose-200 text-rose-800 px-2 py-1 rounded-lg font-bold cursor-pointer"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-slate-400 italic">No hay egresos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
)}

{/* ================= MODAL PROPINAS ================= */}
{modalPropinasAbierto && (
  <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="text-xs font-black text-emerald-600 uppercase flex items-center gap-1.5">
          ✨ Gestión de Propinas
        </h3>
        <button 
          onClick={() => {
            setModalPropinasAbierto(false);
            setEditandoPropinaId(null);
            setNuevaPropinaNota('');
            setNuevaPropinaMonto('');
          }} 
          className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Formulario para registrar / editar propina */}
      <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl space-y-2.5">
        <h4 className="text-[10px] font-black text-emerald-900 uppercase">
          {editandoPropinaId ? '✏️ Editar Propina' : 'Registrar Nueva Propina'}
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <input 
            type="text" 
            placeholder="Cliente / Nota (Opcional)" 
            value={nuevaPropinaNota || ''} 
            onChange={e => setNuevaPropinaNota(e.target.value)}
            className="bg-white border border-emerald-200 rounded-xl p-2 text-[10px] text-slate-900 outline-none font-medium"
          />
          <input 
            type="number" 
            placeholder="Monto COP" 
            value={nuevaPropinaMonto || ''} 
            onChange={e => setNuevaPropinaMonto(e.target.value)}
            className="bg-white border border-emerald-200 rounded-xl p-2 text-[10px] text-slate-900 outline-none font-medium"
          />
        </div>
        <div className="flex gap-2">
          {editandoPropinaId && (
            <button
              type="button"
              onClick={() => {
                setEditandoPropinaId(null);
                setNuevaPropinaNota('');
                setNuevaPropinaMonto('');
              }}
              className="w-1/3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded-xl text-[10px] uppercase shadow-xs transition cursor-pointer"
            >
              Cancelar
            </button>
          )}
          <button
            type="button"
            onClick={async () => {
              if (!nuevaPropinaMonto) {
                alert('Ingresa el monto de la propina.');
                return;
              }
              try {
                if (editandoPropinaId) {
                  await updateDoc(doc(db, 'propinas', editandoPropinaId), {
                    nota: nuevaPropinaNota || 'Propina general',
                    monto: Number(nuevaPropinaMonto)
                  });
                  alert('¡Propina actualizada con éxito!');
                  setEditandoPropinaId(null);
                } else {
                const currentUser = auth.currentUser;
  if (!currentUser) {
    alert('No hay una sesión activa.');
    return;
  }
  await addDoc(collection(db, 'propinas'), {
    barberoId: currentUser.uid, // ✅ Corregido
    nota: nuevaPropinaNota || 'Propina general',
    monto: Number(nuevaPropinaMonto),
    fechaHora: new Date().toISOString()
  });
  alert('¡Propina guardada con éxito!');
                }
                setNuevaPropinaNota('');
                setNuevaPropinaMonto('');
              } catch (err) {
                console.error(err);
                alert('Error al guardar la propina.');
              }
            }}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-[10px] uppercase shadow-xs transition cursor-pointer"
          >
            {editandoPropinaId ? 'Actualizar Propina' : 'Guardar Propina'}
          </button>
        </div>
      </div>

      {/* Historial de Propinas con Acciones */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-black text-slate-700 uppercase">Historial de Propinas</h4>
        <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-[10px]">
            <thead className="bg-slate-50 text-slate-500 uppercase sticky top-0">
              <tr>
                <th className="p-2">Nota / Cliente</th>
                <th className="p-2">Monto</th>
                <th className="p-2">Fecha / Hora</th>
                <th className="p-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listaPropinas && listaPropinas.length > 0 ? (
                listaPropinas.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-2 font-bold text-slate-800">{item.nota}</td>
                    <td className="p-2 text-emerald-600 font-black">+${Number(item.monto || 0).toLocaleString()}</td>
                    <td className="p-2 text-slate-400">{item.fechaHora ? new Date(item.fechaHora).toLocaleString() : 'N/A'}</td>
                    <td className="p-2 flex items-center justify-center gap-1.5">
                      <button 
                        type="button"
                        onClick={() => {
                          setEditandoPropinaId(item.id);
                          setNuevaPropinaNota(item.nota);
                          setNuevaPropinaMonto(item.monto);
                        }}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-2 py-1 rounded-lg font-bold cursor-pointer"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        type="button"
                        onClick={async () => {
                          if (window.confirm('¿Estás seguro de eliminar esta propina?')) {
                            try {
                              await deleteDoc(doc(db, 'propinas', item.id));
                              alert('Propina eliminada');
                            } catch (err) {
                              console.error(err);
                              alert('Error al eliminar');
                            }
                          }
                        }}
                        className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-2 py-1 rounded-lg font-bold cursor-pointer"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-slate-400 italic">No hay propinas registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Wallet;