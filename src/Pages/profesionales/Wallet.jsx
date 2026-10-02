import React, { useState, useEffect } from 'react';
import { Plus, Wallet as WalletIcon, Calendar, Eye, Edit3, Trash2, Clock, User, Scissors, CheckCircle2, Percent, Layers } from 'lucide-react';
import { db, auth } from '../../components/firebase'; 
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

const Wallet = () => {
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
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [porcentajeBarbero, setPorcentajeBarbero] = useState(35);
  const [alertaExito, setAlertaExito] = useState(false);

  const [modalAgregarOpen, setModalAgregarOpen] = useState(false);
  const [modalVerMasOpen, setModalVerMasOpen] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  const [nuevoServicio, setNuevoServicio] = useState({
    cliente: '',
    servicio: '',
    total: '',
    fecha: hoyStr,
    hora: new Date().toTimeString().slice(0, 5)
  });

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
        const esDelBarbero = user ? item.barberId === user.uid : true;
        return esDelBarbero && item.cliente && item.total !== undefined;
      });

      setServicios(serviciosValidos);
    } catch (error) {
      console.error("Error al conectar con la colección wallet de Firebase:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        obtenerServicios();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGuardarServicio = async (e) => {
    e.preventDefault();
    if (!nuevoServicio.cliente || !nuevoServicio.total) return;

    const user = auth.currentUser;
    if (!user) {
      alert("No hay una sesión de barbero activa. Inicia sesión de nuevo.");
      return;
    }

    setGuardando(true);

    const itemAEnviar = {
      barberId: user.uid, 
      barberEmail: user.email || '', 
      cliente: nuevoServicio.cliente.trim(),
      servicio: nuevoServicio.servicio.trim() || 'Servicio General',
      total: parseFloat(nuevoServicio.total),
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
        fecha: hoyStr, 
        hora: new Date().toTimeString().slice(0, 5) 
      });
      setModalAgregarOpen(false);

      setAlertaExito(true);
      setTimeout(() => {
        setAlertaExito(false);
      }, 3500);

    } catch (error) {
      console.error("Error detallado al guardar en Firebase:", error);
      alert("No se pudo guardar en Firebase. Revisa las Reglas de Seguridad de tu base de datos Firestore.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await deleteDoc(doc(db, 'wallet', id));
      setServicios(servicios.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error al eliminar el registro:", error);
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

  const totalQ1 = serviciosQ1.reduce((acc, item) => acc + (Number(item.total) || 0), 0);
  const totalQ2 = serviciosQ2.reduce((acc, item) => acc + (Number(item.total) || 0), 0);
  const esPrimeraQuincenaActiva = diaActual <= 15;

  const filtrarServiciosPorTiempo = () => {
    return servicios.filter(item => {
      if (!item.fecha) return false;
      const fechaItem = new Date(item.fecha + 'T00:00:00');
      
      if (filtroTiempo === 'dia') {
        return item.fecha === hoyStr;
      } 
      else if (filtroTiempo === 'especifico') {
        return item.fecha === fechaEspecifica;
      }
      else if (filtroTiempo === 'rango') {
        return item.fecha >= fechaInicio && item.fecha <= fechaFin;
      }
      else if (filtroTiempo === 'semana') {
        const primerDiaSemana = new Date(hoyObj);
        primerDiaSemana.setDate(hoyObj.getDate() - hoyObj.getDay());
        return fechaItem >= primerDiaSemana && fechaItem <= hoyObj;
      } 
      else if (filtroTiempo === 'quincena') {
        const inicio = new Date(anioActual, mesActual, esPrimeraQuincenaActiva ? 1 : 16);
        const fin = new Date(anioActual, mesActual + 1, esPrimeraQuincenaActiva ? 16 : 0);
        return fechaItem >= inicio && fechaItem <= fin;
      } 
      else if (filtroTiempo === 'mes') {
        return fechaItem.getMonth() === mesActual && fechaItem.getFullYear() === anioActual;
      } 
      else if (filtroTiempo === 'anio') {
        return fechaItem.getFullYear() === anioActual;
      }
      return true;
    });
  };

  const serviciosFiltrados = filtrarServiciosPorTiempo();
  const totalWallet = serviciosFiltrados.reduce((acc, item) => acc + (Number(item.total) || 0), 0);
  
  const porcentajeDecimal = (Number(porcentajeBarbero) || 0) / 100;
  const gananciaBarbero = totalWallet * porcentajeDecimal;

  return (
    <div className="p-2 sm:p-4 bg-slate-50 text-slate-800 min-h-screen max-w-4xl mx-auto relative font-sans">
      
      {/* ALERTA FLOTANTE ÉXITO */}
      {alertaExito && (
        <div className="fixed top-3 right-3 z-50 animate-bounce">
          <div className="bg-white border border-amber-300 text-slate-800 px-3 py-2 rounded-xl shadow-xl flex items-center gap-2 text-xs">
            <CheckCircle2 size={16} className="text-yellow-600" />
            <div>
              <p className="font-bold text-yellow-700 text-[11px]">¡Guardado con éxito!</p>
            </div>
          </div>
        </div>
      )}

      {/* 1. HEADER */}
      <div className="flex justify-between items-center mb-3 px-1">
        <div>
          <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
            <WalletIcon className="text-yellow-600" size={20} /> Billetera
          </h1>
          <p className="text-slate-500 text-[10px] sm:text-xs">Control de ingresos y caja profesional.</p>
        </div>

        <button
          onClick={() => setModalAgregarOpen(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-sm text-xs"
        >
          <Plus size={15} /> Registrar
        </button>
      </div>

      {/* 2. CONTEO VISUAL DE QUINCENAS */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Q1: Días 1 al 15 */}
        <div className={`p-2.5 rounded-xl border transition-all ${esPrimeraQuincenaActiva ? 'bg-amber-100/70 border-yellow-400 shadow-sm' : 'bg-white border-slate-200 opacity-80'}`}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-yellow-800 flex items-center gap-1">
              <Layers size={11} /> 1ra Quincena (1-15)
            </span>
            {esPrimeraQuincenaActiva && (
              <span className="bg-yellow-400 text-slate-900 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">ACTUAL</span>
            )}
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-600 font-medium">{serviciosQ1.length} serv.</span>
            <span className="text-sm font-extrabold text-yellow-800">${totalQ1.toLocaleString()}</span>
          </div>
        </div>

        {/* Q2: Días 16 al Fin de Mes */}
        <div className={`p-2.5 rounded-xl border transition-all ${!esPrimeraQuincenaActiva ? 'bg-amber-100/70 border-yellow-400 shadow-sm' : 'bg-white border-slate-200 opacity-80'}`}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-yellow-800 flex items-center gap-1">
              <Layers size={11} /> 2da Quincena (16-{ultimoDiaMes})
            </span>
            {!esPrimeraQuincenaActiva && (
              <span className="bg-yellow-400 text-slate-900 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">ACTUAL</span>
            )}
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-600 font-medium">{serviciosQ2.length} serv.</span>
            <span className="text-sm font-extrabold text-yellow-800">${totalQ2.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 3. PESTAÑAS DE FILTRO TEMPORAL */}
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
                ? 'bg-yellow-500 text-slate-950 shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtroTiempo === 'especifico' && (
        <div className="bg-amber-50 border border-yellow-200 p-2.5 rounded-xl mb-3 flex items-center justify-between gap-2 text-[11px]">
          <span className="font-semibold text-yellow-900 flex items-center gap-1">
            <Calendar size={13} /> Día a consultar:
          </span>
          <input
            type="date"
            value={fechaEspecifica}
            onChange={(e) => setFechaEspecifica(e.target.value)}
            className="bg-white border border-yellow-300 rounded-lg px-2 py-1 text-slate-800 focus:outline-none focus:border-yellow-500 font-medium"
          />
        </div>
      )}

      {filtroTiempo === 'rango' && (
        <div className="bg-amber-50 border border-yellow-200 p-2.5 rounded-xl mb-3 grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <label className="block font-semibold text-yellow-900 mb-1">Desde:</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full bg-white border border-yellow-300 rounded-lg px-2 py-1 text-slate-800 focus:outline-none font-medium"
            />
          </div>
          <div>
            <label className="block font-semibold text-yellow-900 mb-1">Hasta:</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full bg-white border border-yellow-300 rounded-lg px-2 py-1 text-slate-800 focus:outline-none font-medium"
            />
          </div>
        </div>
      )}

      {/* 4. TARJETA PRINCIPAL WALLET */}
      <div className="bg-white border border-yellow-200 p-3.5 rounded-xl mb-3 shadow-sm relative">
        <div className="flex justify-between items-center gap-2 mb-2">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            Mi Ganancia ({filtroTiempo})
          </span>
          
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-[11px]">
            <Percent size={12} className="text-yellow-600" />
            <span className="text-slate-500">Mi %:</span>
            <input
              type="number"
              min="0"
              max="100"
              value={porcentajeBarbero}
              onChange={(e) => setPorcentajeBarbero(e.target.value)}
              className="w-10 bg-white border border-slate-300 rounded px-1 py-0.5 text-center font-bold text-yellow-700 focus:outline-none focus:border-yellow-500"
            />
            <span className="text-slate-500 font-bold">%</span>
          </div>
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

      {/* 5. TABLA DE REGISTROS */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-white">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1">
            <Scissors size={14} className="text-yellow-600" /> Historial de Servicios
          </h3>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold border border-slate-200">
            {serviciosFiltrados.length} reg.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
                <th className="py-2.5 px-3">Fecha/Hora</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Servicio</th>
                <th className="py-2.5 px-3">Valor</th>
                <th className="py-2.5 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px] sm:text-xs">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-400">Cargando registros...</td>
                </tr>
              ) : serviciosFiltrados.length > 0 ? (
                serviciosFiltrados.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock size={11} className="text-slate-400" />
                        <span>{item.fecha} <span className="text-[9px] text-slate-400">{item.hora}</span></span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <User size={11} className="text-slate-400" /> {item.cliente}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-[100px]">{item.servicio}</td>
                    <td className="py-2.5 px-3 font-bold text-yellow-800 whitespace-nowrap">${Number(item.total).toLocaleString()}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => { setServicioSeleccionado(item); setModalVerMasOpen(true); }}
                          title="Ver más"
                          className="p-1 bg-slate-50 hover:bg-slate-100 text-blue-600 rounded border border-slate-200 transition-colors"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          title="Editar"
                          className="p-1 bg-slate-50 hover:bg-slate-100 text-yellow-700 rounded border border-slate-200 transition-colors"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleEliminar(item.id)}
                          title="Eliminar"
                          className="p-1 bg-slate-50 hover:bg-slate-100 text-rose-600 rounded border border-slate-200 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-400 text-[11px]">
                    No hay servicios registrados en este período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL AGREGAR */}
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

              <div>
                <label className="block font-medium text-slate-600 mb-0.5">Valor del Servicio (COP)</label>
                <input
                  type="number"
                  required
                  value={nuevoServicio.total}
                  onChange={(e) => setNuevoServicio({ ...nuevoServicio, total: e.target.value })}
                  placeholder="Ej. 45000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-600 mb-0.5">Fecha</label>
                  <input
                    type="date"
                    value={nuevoServicio.fecha}
                    onChange={(e) => setNuevoServicio({ ...nuevoServicio, fecha: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-0.5">Hora</label>
                  <input
                    type="time"
                    value={nuevoServicio.hora}
                    onChange={(e) => setNuevoServicio({ ...nuevoServicio, hora: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 focus:outline-none focus:border-yellow-500"
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

      {/* MODAL VER MÁS */}
      {modalVerMasOpen && servicioSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center p-3 z-50">
          <div className="bg-white border border-yellow-200 rounded-xl p-4 max-w-xs w-full shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 mb-2.5">Detalle de Transacción</h3>
            <div className="space-y-1.5 text-[11px] text-slate-700 mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <p><strong className="text-slate-500">Cliente:</strong> {servicioSeleccionado.cliente}</p>
              <p><strong className="text-slate-500">Servicio:</strong> {servicioSeleccionado.servicio}</p>
              <p><strong className="text-slate-500">Fecha y Hora:</strong> {servicioSeleccionado.fecha} - {servicioSeleccionado.hora}</p>
              <p><strong className="text-slate-500">Valor Cobrado:</strong> <span className="text-yellow-800 font-bold">${Number(servicioSeleccionado.total).toLocaleString()} COP</span></p>
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

    </div>
  );
};

export default Wallet;