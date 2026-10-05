import React, { useState, useEffect } from 'react';
import { Plus, Wallet as WalletIcon, Calendar, Eye, Edit3, Trash2, Clock, User, Scissors, CheckCircle2, Percent, Layers, ChevronRight, AlertTriangle, X, Home, Edit2, EyeOff } from 'lucide-react';
import { db, auth } from '../../components/firebase'; 
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

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

  const [porcentajeBarbero, setPorcentajeBarbero] = useState(35);
  const [alertaExito, setAlertaExito] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('¡Guardado con éxito!');
  const [diaSeleccionadoModal, setDiaSeleccionadoModal] = useState(null);
  const [modalAgregarOpen, setModalAgregarOpen] = useState(false);
  const [modalVerMasOpen, setModalVerMasOpen] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  const [modalDiaOpen, setModalDiaOpen] = useState(false);
  const [diaSeleccionadoDetalle, setDiaSeleccionadoDetalle] = useState(null);

  const [modalCitaDetalleOpen, setModalCitaDetalleOpen] = useState(false);
  const [citaSeleccionadaDetalle, setCitaSeleccionadaDetalle] = useState(null);

  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [servicioAEliminar, setServicioAEliminar] = useState(null);

  const [modalEditarOpen, setModalEditarOpen] = useState(false);
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
    porcentajeBarberForm: '35',
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
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        obtenerServicios();
        obtenerCitasFinalizadas();
        obtenerServiciosDisponibles();
      } else {
        setLoading(false);
        setLoadingCitas(false);
      }
    });
    return () => unsubscribe();
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
        total: '', 
        porcentajeBarberForm: '35',
        fecha: hoyStr, 
        hora: new Date().toTimeString().slice(0, 5),
        serviciosSeleccionados: []
      });
      setModalAgregarOpen(false);
      setMensajeExito('¡Guardado con éxito!');
      setAlertaExito(true);
      setTimeout(() => setAlertaExito(false), 3500);
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
      setTimeout(() => setAlertaExito(false), 3000);
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
      setTimeout(() => setAlertaExito(false), 3500);
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

  const serviciosFiltrados = filtrarServiciosPorTiempo(servicios);
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
          <p className="text-slate-500 text-[10px] sm:text-xs">Control de porcentajes y servicios a domicilio.</p>
        </div>

        {vistaTab === 'manual' && (
          <button
            onClick={() => setModalAgregarOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-sm text-xs cursor-pointer"
          >
            <Plus size={15} /> Registrar
          </button>
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
      </div>

      {vistaTab === 'manual' && (() => {
        const obtenerDatosDiario = (diaInicio, diaFin) => {
          const dias = [];
          for (let d = diaInicio; d <= diaFin; d++) {
            const serviciosDia = servicios.filter(s => {
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
              <div 
                onClick={() => setQuincenaActivaModal({ titulo: '1ra Quincena (1-15)', datos: datosQ1, total: totalRealQ1, serv: totalServiciosQ1, grafico: q1Grafico })}
                className={`p-2.5 rounded-xl border transition-all relative overflow-hidden cursor-pointer hover:border-blue-500 hover:shadow-md ${esPrimeraQuincenaActiva ? 'bg-blue-50/90 border-blue-400 shadow-sm' : 'bg-white border-slate-200 opacity-80'}`}
              >
                <div className="flex justify-between items-center mb-1 relative z-10">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-blue-900 flex items-center gap-1">
                    <Layers size={11} className="text-blue-600" /> 1ra Quincena (1-15)
                  </span>
                  {esPrimeraQuincenaActiva && <span className="bg-blue-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow-sm">ACTUAL</span>}
                </div>
                
                <div className="h-7 w-full my-1 relative z-10 flex items-center">
                  <svg viewBox="0 0 120 26" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="gradQ1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d={q1Grafico.areaD} fill="url(#gradQ1)" />
                    <path d={q1Grafico.pathD} fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    {q1Grafico.puntos.map((pt, i) => (
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

              <div 
                onClick={() => setQuincenaActivaModal({ titulo: `2da Quincena (16-${ultimoDiaMes})`, datos: datosQ2, total: totalRealQ2, serv: totalServiciosQ2, grafico: q2Grafico })}
                className={`p-2.5 rounded-xl border transition-all relative overflow-hidden cursor-pointer hover:border-blue-500 hover:shadow-md ${!esPrimeraQuincenaActiva ? 'bg-blue-50/90 border-blue-400 shadow-sm' : 'bg-white border-slate-200 opacity-80'}`}
              >
                <div className="flex justify-between items-center mb-1 relative z-10">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-blue-900 flex items-center gap-1">
                    <Layers size={11} className="text-blue-600" /> 2da Quincena (16-{ultimoDiaMes})
                  </span>
                  {!esPrimeraQuincenaActiva && <span className="bg-blue-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow-sm">ACTUAL</span>}
                </div>

                <div className="h-7 w-full my-1 relative z-10 flex items-center">
                  <svg viewBox="0 0 120 26" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="gradQ2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d={q2Grafico.areaD} fill="url(#gradQ2)" />
                    <path d={q2Grafico.pathD} fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    {q2Grafico.puntos.map((pt, i) => (
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

                      <div className="bg-slate-950 p-4 rounded-xl border border-blue-500/30 relative">
                        <div className="flex justify-between text-[10px] text-cyan-400 mb-2 font-mono">
                          <span>MÁX: ${modalGrafico.max.toLocaleString()}</span>
                          <span>GRÁFICO DIARIO (TENDENCIA)</span>
                        </div>
                        
                        <div className="h-28 w-full">
                          <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                            <defs>
                              <linearGradient id="modalGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            <path d={modalGrafico.areaD} fill="url(#modalGrad)" />
                            <path d={modalGrafico.pathD} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            {modalGrafico.puntos.map((pt, i) => (
                              <g key={i}>
                                <circle 
                                  cx={pt.x} 
                                  cy={pt.y} 
                                  r={pt.monto > 0 ? 5 : 2} 
                                  className={pt.monto > 0 ? 'fill-cyan-400 ring-4 ring-cyan-500/20' : 'fill-slate-600'} 
                                />
                              </g>
                            ))}
                          </svg>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Desglose Día por Día</h4>
                          <span className="text-[10px] text-blue-600 font-medium">Haz clic en un día para ver detalles</span>
                        </div>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {quincenaActivaModal.datos.map((item, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => setDiaSeleccionadoModal(item.dia)}
                              className={`flex justify-between items-center px-3 py-2.5 rounded-lg text-xs cursor-pointer transition-all border ${
                                item.monto > 0 
                                  ? 'bg-blue-50/60 border-blue-200 hover:border-blue-400 hover:bg-blue-100/60 text-slate-900 font-medium shadow-sm' 
                                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${item.monto > 0 ? 'bg-blue-600' : 'bg-slate-300'}`}></span>
                                Día {item.dia}
                              </span>
                              <div className="flex items-center gap-3">
                                <span className="text-[11px] text-slate-500">{item.serviciosCount} serv.</span>
                                <span className={`font-bold ${item.monto > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                                  ${item.monto.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </span>
                              </div>
                            </div>
                          ))}
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

                  {diaSeleccionadoModal !== null && (() => {
                    const serviciosDelDia = servicios.filter(s => {
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
                    });

                    const totalGananciasDia = serviciosDelDia.reduce((acc, curr) => {
                      const val = (curr.ganancias !== undefined && !isNaN(Number(curr.ganancias))) 
                        ? Number(curr.ganancias) 
                        : (Number(curr.total) || 0);
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
                                return (
                                  <div key={i} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2 hover:border-blue-400 transition-all">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <span className="text-xs font-bold text-blue-900 block">{srv.servicio || 'Servicio sin nombre'}</span>
                                        <span className="text-xs text-slate-600 font-medium">Cliente: {srv.cliente || 'General'}</span>
                                      </div>
                                      <div className="text-right">
                                        <span className="text-xs font-extrabold text-blue-600 block">+${gananciaServicio.toLocaleString()}</span>
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

      {vistaTab === 'manual' ? (
        <div className="bg-white border border-blue-200 p-3.5 rounded-xl mb-3 shadow-sm relative">
          <div className="flex justify-between items-center gap-2 mb-2">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Calendar size={12} className="text-blue-600" /> Mi Ganancia Manual • <span className="text-slate-800 capitalize">{obtenerTextoFechaRecuadro()}</span>
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900">
              ${gananciaBarbero.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h2>
            <span className="text-blue-700 font-bold text-xs">COP</span>
          </div>

          <div className="mt-1.5 text-[10px] text-slate-500 flex items-center gap-1 font-medium">
            <span>Producido total caja:</span>
            <span className="text-slate-800 font-bold">${totalWallet.toLocaleString()} COP</span>
          </div>
        </div>
      ) : (
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
                      className="p-3 flex items-center justify-between hover:bg-blue-50/40 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0 border border-blue-200">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-blue-950">{srv.servicio || 'Servicio sin nombre'}</p>
                          <p className="text-[10px] text-slate-600 font-medium">
                            Cliente: <span className="text-blue-700 font-semibold">{srv.cliente || 'General'}</span>
                          </p>
                          <p className="text-[9px] text-blue-500 font-mono mt-0.5">
                            {srv.fecha || 'Fecha N/A'} • {srv.hora || 'Hora N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-extrabold text-blue-600">+${gananciaServicio.toLocaleString()} COP</p>
                          <p className="text-[10px] text-slate-500">Total: ${totalServicio.toLocaleString()}</p>
                          {srv.porcentajeValor && (
                            <span className="inline-block mt-0.5 text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-medium border border-blue-200">
                              {srv.porcentajeValor}%
                            </span>
                          )}
                        </div>

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
                <select
                  onChange={(e) => {
                    const servicioId = e.target.value;
                    if (!servicioId) return;
                    const listaServicios = Array.isArray(serviciosFirebase) ? serviciosFirebase : [];
                    const servicioEncontrado = listaServicios.find(s => s.id === servicioId);
                    
                    if (servicioEncontrado) {
                      const yaSeleccionado = (nuevoServicio.serviciosSeleccionados || []).some(s => s.id === servicioId);
                      if (!yaSeleccionado) {
                        const nuevosSeleccionados = [...(nuevoServicio.serviciosSeleccionados || []), servicioEncontrado];
                        
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
                    }
                    e.target.value = ""; 
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 mb-2 cursor-pointer"
                >
                  <option value="">Selecciona un servicio...</option>
                  {Array.isArray(serviciosFirebase) && 
                    serviciosFirebase
                      .filter(serv => {
                        const duracion = serv.duracion ? String(serv.duracion).toLowerCase().trim() : '';
                        return duracion === 'interno';
                      })
                      .map(serv => (
                        <option key={serv.id} value={serv.id}>
                          {serv.nombre || serv.servicio} (${serv.precio || serv.total})
                        </option>
                      ))
                  }
                </select>

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
                  <label className="block font-medium text-slate-600 mb-0.5">% Barbero</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={nuevoServicio.porcentajeBarberForm}
                    onChange={(e) => setNuevoServicio({ ...nuevoServicio, porcentajeBarberForm: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 font-bold"
                  />
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

    </div>
  );
};

export default Wallet;