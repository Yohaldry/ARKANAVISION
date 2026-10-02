import React, { useState, useEffect } from 'react';
import { Plus, Wallet as WalletIcon, Calendar, Eye, Edit3, Trash2, Clock, User, Scissors, CheckCircle2, Percent, Layers, ChevronRight, AlertTriangle, X, Home } from 'lucide-react';
import { db, auth } from '../../components/firebase'; 
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const Wallet = () => {
  const [vistaTab, setVistaTab] = useState('domicilios'); // Iniciamos en domicilios para verificar rápido

  const [filtroTiempo, setFiltroTiempo] = useState('dia');
  
  const obtenerFechaLocal = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const hoyStr = obtenerFechaLocal();
  const [fechaEspecifica, setFechaEspecifica] = useState(hoyStr);
  const [fechaInicio, setFechaInicio] = useState(hoyStr);
  const [fechaFin, setFechaFin] = useState(hoyStr);

  const [servicios, setServicios] = useState([]);
  const [citasFinalizadas, setCitasFinalizadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCitas, setLoadingCitas] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [porcentajeBarbero, setPorcentajeBarbero] = useState(35);
  const [alertaExito, setAlertaExito] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('¡Guardado con éxito!');

  const [modalAgregarOpen, setModalAgregarOpen] = useState(false);
  const [modalVerMasOpen, setModalVerMasOpen] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  // Modal detalle del día (Manual)
  const [modalDiaOpen, setModalDiaOpen] = useState(false);
  const [diaSeleccionadoDetalle, setDiaSeleccionadoDetalle] = useState(null);

  // Modal detalle de cita finalizada (Domicilio)
  const [modalCitaDetalleOpen, setModalCitaDetalleOpen] = useState(false);
  const [citaSeleccionadaDetalle, setCitaSeleccionadaDetalle] = useState(null);

  // Alerta de Eliminación
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [servicioAEliminar, setServicioAEliminar] = useState(null);

  // Edición de Servicio Manual
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

  // Formulario Agregar Manual
  const [nuevoServicio, setNuevoServicio] = useState({
    cliente: '',
    servicio: '',
    total: '',
    porcentajeBarberForm: '35',
    fecha: hoyStr,
    hora: new Date().toTimeString().slice(0, 5)
  });

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

  // Obtener citas finalizadas desde la colección 'citas'[cite: 11] filtrando por el barbero autenticado
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
        // Validamos contra 'barberoId' (como viene en tu base de datos) y variantes
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
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        obtenerServicios();
        obtenerCitasFinalizadas();
      } else {
        setLoading(false);
        setLoadingCitas(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const parsearPrecioCita = (cita) => {
    // Buscamos en los posibles campos de precio dentro del documento de la cita, priorizando precioTotal
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
        hora: new Date().toTimeString().slice(0, 5) 
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

  const confirmarEliminarServicio = (item) => {
    setServicioAEliminar(item);
    setModalEliminarOpen(true);
  };

  const ejecutarEliminacion = async () => {
    if (!servicioAEliminar) return;
    try {
      await deleteDoc(doc(db, 'wallet', servicioAEliminar.id));
      setServicios(servicios.filter(item => item.id !== servicioAEliminar.id));
      setModalEliminarOpen(false);
      setServicioAEliminar(false);
      setModalVerMasOpen(false);

      if (diaSeleccionadoDetalle) {
        const nuevosServiciosDia = diaSeleccionadoDetalle.servicios.filter(s => s.id !== servicioAEliminar.id);
        if (nuevosServiciosDia.length === 0) {
          setModalDiaOpen(false);
        } else {
          setDiaSeleccionadoDetalle({
            ...diaSeleccionadoDetalle,
            servicios: nuevosServiciosDia,
            totalCaja: nuevosServiciosDia.reduce((acc, s) => acc + (Number(s.total) || 0), 0),
            totalGanancia: nuevosServiciosDia.reduce((acc, s) => acc + (Number(s.ganancias) || 0), 0)
          });
        }
      }

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

  const serviciosQ1 = servicios.filter(item => {
    if (!item.fecha) return false;
    const [y, m, d] = item.fecha.split('-').map(Number);
    return y === anioActual && (m - 1) === mesActual && d >= 1 && d <= 15;
  });

  const serviciosQ2 = servicios.filter(item => {
    if (!item.fecha) return false;
    const [y, m, d] = item.fecha.split('-').map(Number);
    return y === anioActual && (m - 1) === mesActual && d >= 16 && d <= ultimoDiaMes;
  });

  const gananciaQ1 = serviciosQ1.reduce((acc, item) => {
    const g = item.ganancias !== undefined ? Number(item.ganancias) : ((Number(item.total) || 0) * (Number(porcentajeBarbero) || 0) / 100);
    return acc + g;
  }, 0);

  const gananciaQ2 = serviciosQ2.reduce((acc, item) => {
    const g = item.ganancias !== undefined ? Number(item.ganancias) : ((Number(item.total) || 0) * (Number(porcentajeBarbero) || 0) / 100);
    return acc + g;
  }, 0);

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

  const obtenerDiasAgrupados = () => {
    const diasMap = {};
    serviciosFiltrados.forEach(item => {
      if (!diasMap[item.fecha]) {
        diasMap[item.fecha] = { fecha: item.fecha, totalCaja: 0, totalGanancia: 0, servicios: [] };
      }
      const t = Number(item.total) || 0;
      const g = item.ganancias !== undefined ? Number(item.ganancias) : (t * (Number(porcentajeBarbero) || 0) / 100);
      
      diasMap[item.fecha].totalCaja += t;
      diasMap[item.fecha].totalGanancia += g;
      diasMap[item.fecha].servicios.push(item);
    });

    return Object.values(diasMap).sort((a, b) => b.fecha.localeCompare(a.fecha));
  };

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

  const diasAgrupados = obtenerDiasAgrupados();
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
      
      {/* ALERTA FLOTANTE ÉXITO */}
      {alertaExito && (
        <div className="fixed top-3 right-3 z-50 animate-bounce">
          <div className="bg-white border border-amber-300 text-slate-800 px-3 py-2 rounded-xl shadow-xl flex items-center gap-2 text-xs">
            <CheckCircle2 size={16} className="text-yellow-600" />
            <p className="font-bold text-yellow-700 text-[11px]">{mensajeExito}</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-3 px-1">
        <div>
          <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
            <WalletIcon className={vistaTab === 'manual' ? 'text-yellow-600' : 'text-blue-600'} size={20} /> 
            Billetera y Gestión
          </h1>
          <p className="text-slate-500 text-[10px] sm:text-xs">Control de porcentajes y servicios a domicilio.</p>
        </div>

        {vistaTab === 'manual' && (
          <button
            onClick={() => setModalAgregarOpen(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-sm text-xs"
          >
            <Plus size={15} /> Registrar
          </button>
        )}
      </div>

      {/* PESTAÑAS PRINCIPALES */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={() => setVistaTab('manual')}
          className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border ${
            vistaTab === 'manual'
              ? 'bg-yellow-500 text-slate-950 border-yellow-600 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Percent size={14} /> Gestión Manual (%)
        </button>
        <button
          onClick={() => setVistaTab('domicilios')}
          className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border ${
            vistaTab === 'domicilios'
              ? 'bg-blue-900 text-white border-blue-950 shadow-md'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Home size={14} /> Domicilios 100% ({citasFinalizadas.length})
        </button>
      </div>

      {/* QUINCENAS (SOLO EN VISTA MANUAL) */}
      {vistaTab === 'manual' && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className={`p-2.5 rounded-xl border transition-all ${esPrimeraQuincenaActiva ? 'bg-amber-100/70 border-yellow-400 shadow-sm' : 'bg-white border-slate-200 opacity-80'}`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold tracking-wider uppercase text-yellow-800 flex items-center gap-1">
                <Layers size={11} /> 1ra Quincena (1-15)
              </span>
              {esPrimeraQuincenaActiva && <span className="bg-yellow-400 text-slate-900 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">ACTUAL</span>}
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-600 font-medium">{serviciosQ1.length} serv.</span>
              <span className="text-sm font-extrabold text-yellow-800">${gananciaQ1.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          <div className={`p-2.5 rounded-xl border transition-all ${!esPrimeraQuincenaActiva ? 'bg-amber-100/70 border-yellow-400 shadow-sm' : 'bg-white border-slate-200 opacity-80'}`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold tracking-wider uppercase text-yellow-800 flex items-center gap-1">
                <Layers size={11} /> 2da Quincena (16-{ultimoDiaMes})
              </span>
              {!esPrimeraQuincenaActiva && <span className="bg-yellow-400 text-slate-900 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">ACTUAL</span>}
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-600 font-medium">{serviciosQ2.length} serv.</span>
              <span className="text-sm font-extrabold text-yellow-800">${gananciaQ2.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>
      )}

      {/* FILTROS TIEMPO */}
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
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
              filtroTiempo === tab.id
                ? (vistaTab === 'manual' ? 'bg-yellow-500 text-slate-950 shadow-sm' : 'bg-blue-900 text-white shadow-sm')
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtroTiempo === 'especifico' && (
        <div className={`p-2.5 rounded-xl mb-3 flex items-center justify-between gap-2 text-[11px] border ${
          vistaTab === 'manual' ? 'bg-amber-50 border-yellow-200 text-yellow-900' : 'bg-blue-50 border-blue-200 text-blue-950'
        }`}>
          <span className="font-semibold flex items-center gap-1">
            <Calendar size={13} /> Día a consultar:
          </span>
          <input
            type="date"
            value={fechaEspecifica}
            onChange={(e) => setFechaEspecifica(e.target.value)}
            className={`bg-white rounded-lg px-2 py-1 text-slate-800 focus:outline-none font-medium border ${
              vistaTab === 'manual' ? 'border-yellow-300' : 'border-blue-300'
            }`}
          />
        </div>
      )}

      {filtroTiempo === 'rango' && (
        <div className={`p-2.5 rounded-xl mb-3 grid grid-cols-2 gap-2 text-[11px] border ${
          vistaTab === 'manual' ? 'bg-amber-50 border-yellow-200 text-yellow-900' : 'bg-blue-50 border-blue-200 text-blue-950'
        }`}>
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

      {/* TARJETA PRINCIPAL SEGÚN PESTAÑA ACTIVA */}
      {vistaTab === 'manual' ? (
        <div className="bg-white border border-yellow-200 p-3.5 rounded-xl mb-3 shadow-sm relative">
          <div className="flex justify-between items-center gap-2 mb-2">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Calendar size={12} className="text-yellow-600" /> Mi Ganancia Manual • <span className="text-slate-800 capitalize">{obtenerTextoFechaRecuadro()}</span>
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-yellow-800">
              ${gananciaBarbero.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h2>
            <span className="text-yellow-700 font-bold text-xs">COP</span>
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

      {/* RESUMEN AGRUPADO */}
      {vistaTab === 'manual' ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-white">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <Calendar size={14} className="text-yellow-600" /> Resumen Actividad Manual
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold border border-slate-200">
              {diasAgrupados.length} días con actividad
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="py-6 text-center text-slate-400 text-xs">Cargando datos...</div>
            ) : diasAgrupados.length > 0 ? (
              diasAgrupados.map((grupo) => (
                <div 
                  key={grupo.fecha}
                  onClick={() => { setDiaSeleccionadoDetalle(grupo); setModalDiaOpen(true); }}
                  className="p-3 flex items-center justify-between hover:bg-amber-50/65 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-100/70 text-yellow-800 rounded-lg">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{grupo.fecha}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{grupo.servicios.length} servicios registrados</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-yellow-800">${grupo.totalCaja.toLocaleString()} COP</p>
                      <p className="text-[10px] text-emerald-600 font-semibold">Ganancia: ${grupo.totalGanancia.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
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
                            className="px-2.5 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded-lg shadow-2xs text-[10px] flex items-center gap-1 font-medium transition-all"
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
                No hay citas con estado <strong className="text-blue-900">finalizado</strong> (o <strong className="text-blue-900">finalizada</strong>) registradas para este perfil en este período.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE DÍA SELECCIONADO (MANUAL) */}
      {modalDiaOpen && diaSeleccionadoDetalle && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center p-3 z-50">
          <div className="bg-white border border-yellow-200 rounded-xl p-4 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Detalle del Día</h3>
                <p className="text-[11px] text-yellow-800 font-semibold">{diaSeleccionadoDetalle.fecha}</p>
              </div>
              <span className="text-[10px] bg-amber-100 text-yellow-900 font-bold px-2 py-0.5 rounded-full">
                Total: ${diaSeleccionadoDetalle.totalCaja.toLocaleString()}
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto mb-3 pr-1">
              {diaSeleccionadoDetalle.servicios.map((s) => (
                <div key={s.id} className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900 flex items-center gap-1">
                      <User size={11} className="text-slate-400" /> {s.cliente}
                    </p>
                    <p className="text-[10px] text-slate-500">{s.servicio} • <span className="text-slate-400">{s.hora}</span></p>
                    {s.ganancias !== undefined && (
                      <p className="text-[10px] text-emerald-600 font-semibold">Ganancia: ${Number(s.ganancias).toLocaleString()}</p>
                    )}
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="font-extrabold text-yellow-800">${Number(s.total).toLocaleString()}</span>
                    <div className="flex items-center gap-1 mt-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setServicioSeleccionado(s); setModalVerMasOpen(true); }}
                        className="p-1 bg-white hover:bg-slate-100 text-blue-600 rounded border border-slate-200"
                        title="Ver más"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); abrirModalEditar(s); }}
                        className="p-1 bg-white hover:bg-slate-100 text-amber-700 rounded border border-slate-200"
                        title="Editar"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); confirmarEliminarServicio(s); }}
                        className="p-1 bg-white hover:bg-slate-100 text-rose-600 rounded border border-slate-200"
                        title="Eliminar"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setModalDiaOpen(false)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-1.5 rounded-lg transition-all text-xs border border-slate-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL VER DETALLE CITA FINALIZADA (DOMICILIO - AZUL OSCURO) */}
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
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-2 rounded-xl transition-all text-xs shadow-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL VER MÁS (MANUAL) */}
      {modalVerMasOpen && servicioSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center p-3 z-50">
          <div className="bg-white border border-yellow-200 rounded-xl p-4 max-w-xs w-full shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 mb-2.5">Detalle de Transacción</h3>
            <div className="space-y-1.5 text-[11px] text-slate-700 mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <p><strong className="text-slate-500">Cliente:</strong> {servicioSeleccionado.cliente}</p>
              <p><strong className="text-slate-500">Servicio:</strong> {servicioSeleccionado.servicio}</p>
              <p><strong className="text-slate-500">Fecha y Hora:</strong> {servicioSeleccionado.fecha} - {servicioSeleccionado.hora}</p>
              <p><strong className="text-slate-500">Valor Total:</strong> <span className="text-yellow-800 font-bold">${Number(servicioSeleccionado.total).toLocaleString()} COP</span></p>
              {servicioSeleccionado.ganancias !== undefined && (
                <p><strong className="text-slate-500">Ganancias:</strong> <span className="text-emerald-600 font-bold">${Number(servicioSeleccionado.ganancias).toLocaleString()} COP</span></p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                onClick={() => abrirModalEditar(servicioSeleccionado)}
                className="bg-amber-50 hover:bg-amber-100 text-yellow-900 font-bold py-1.5 rounded-lg transition-all text-[11px] border border-yellow-300 flex items-center justify-center gap-1"
              >
                <Edit3 size={13} /> Editar
              </button>
              <button
                onClick={() => confirmarEliminarServicio(servicioSeleccionado)}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-1.5 rounded-lg transition-all text-[11px] border border-rose-200 flex items-center justify-center gap-1"
              >
                <Trash2 size={13} /> Eliminar
              </button>
            </div>

            <button
              onClick={() => setModalVerMasOpen(false)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-1.5 rounded-lg transition-all text-[11px] border border-slate-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL ALERTA DE ELIMINACIÓN */}
      {modalEliminarOpen && servicioAEliminar && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex justify-center items-center p-3 z-50">
          <div className="bg-slate-900 border border-yellow-500/50 rounded-2xl p-5 max-w-xs w-full shadow-2xl text-center">
            <div className="w-12 h-12 bg-amber-500/10 border border-yellow-500/30 rounded-full flex items-center justify-center mx-auto mb-3 text-yellow-500">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">¿Eliminar registro?</h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Estás a punto de eliminar el servicio de <strong className="text-yellow-400">{servicioAEliminar.cliente}</strong> por <strong className="text-yellow-400">${Number(servicioAEliminar.total).toLocaleString()}</strong>.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setModalEliminarOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2 rounded-xl text-xs border border-slate-700 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarEliminacion}
                className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold py-2 rounded-xl text-xs shadow-lg transition-all"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR SERVICIO MANUAL */}
      {modalAgregarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center p-3 z-50">
          <div className="bg-white border border-yellow-200 rounded-xl p-4 max-w-xs w-full shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 mb-2.5">Registrar Nuevo Servicio</h3>
            <form onSubmit={handleGuardarServicio} className="space-y-2.5 text-[11px]">
              <div>
                <label className="block font-medium text-slate-600 mb-0.5">Nombre del Cliente</label>
                <input
                  type="text"
                  required
                  value={nuevoServicio.cliente}
                  onChange={(e) => setNuevoServicio({ ...nuevoServicio, cliente: e.target.value })}
                  placeholder="Ej. Carlos Pérez"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-0.5">Descripción del Servicio</label>
                <input
                  type="text"
                  value={nuevoServicio.servicio}
                  onChange={(e) => setNuevoServicio({ ...nuevoServicio, servicio: e.target.value })}
                  placeholder="Ej. Corte Fade + Barba"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-yellow-500"
                />
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-yellow-500"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-yellow-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-0.5">Ganancias (Calculado)</label>
                <input
                  type="text"
                  disabled
                  value={`$${gananciaCalculadaEnVivo.toLocaleString(undefined, { maximumFractionDigits: 0 })} COP`}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-yellow-800 font-extrabold cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-600 mb-0.5">Fecha</label>
                  <input
                    type="date"
                    value={nuevoServicio.fecha}
                    onChange={(e) => setNuevoServicio({ ...nuevoServicio, fecha: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-0.5">Hora</label>
                  <input
                    type="time"
                    value={nuevoServicio.hora}
                    onChange={(e) => setNuevoServicio({ ...nuevoServicio, hora: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={() => setModalAgregarOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-1.5 rounded-lg transition-all border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-slate-950 font-bold py-1.5 rounded-lg transition-all shadow-sm flex items-center justify-center"
                >
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR SERVICIO MANUAL */}
      {modalEditarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center p-3 z-50">
          <div className="bg-white border border-yellow-200 rounded-xl p-4 max-w-xs w-full shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 mb-2.5">Editar Servicio</h3>
            <form onSubmit={handleActualizarServicio} className="space-y-2.5 text-[11px]">
              <div>
                <label className="block font-medium text-slate-600 mb-0.5">Nombre del Cliente</label>
                <input
                  type="text"
                  required
                  value={formEdicion.cliente}
                  onChange={(e) => setFormEdicion({ ...formEdicion, cliente: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-0.5">Descripción del Servicio</label>
                <input
                  type="text"
                  value={formEdicion.servicio}
                  onChange={(e) => setFormEdicion({ ...formEdicion, servicio: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-yellow-500"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-yellow-500"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-yellow-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-0.5">Ganancias (Calculado)</label>
                <input
                  type="text"
                  disabled
                  value={`$${gananciaEditCalculadaEnVivo.toLocaleString(undefined, { maximumFractionDigits: 0 })} COP`}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-yellow-800 font-extrabold cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-600 mb-0.5">Fecha</label>
                  <input
                    type="date"
                    value={formEdicion.fecha}
                    onChange={(e) => setFormEdicion({ ...formEdicion, fecha: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-0.5">Hora</label>
                  <input
                    type="time"
                    value={formEdicion.hora}
                    onChange={(e) => setFormEdicion({ ...formEdicion, hora: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={() => setModalEditarOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-1.5 rounded-lg transition-all border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-slate-950 font-bold py-1.5 rounded-lg transition-all shadow-sm flex items-center justify-center"
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