import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, AlertTriangle, TrendingUp, ArrowDownCircle, ArrowUpCircle, Trash2, Edit3, X, CheckCircle2, DollarSign } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../../components/firebase';

export default function InventarioEstablecimiento({ establecimientoId }) {
  const targetId = establecimientoId || auth.currentUser?.uid;

  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Estados de modales
  const [modalProductoOpen, setModalProductoOpen] = useState(false);
  const [productoEnEdicion, setProductoEnEdicion] = useState(null);
  
  // Modal de Movimiento de Stock (Cargo / Descargo)
  const [modalMovimientoOpen, setModalMovimientoOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [tipoMovimiento, setTipoMovimiento] = useState('cargo'); // 'cargo' (entrada) o 'descargo' (salida)
  const [cantidadMov, setCantidadMov] = useState('');
  const [motivoMov, setMotivoMov] = useState('');

  // Modal de Confirmación de Eliminación
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);

  // Formulario de Producto
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('General');
  const [costo, setCosto] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [stockMinimo, setStockMinimo] = useState('5');
  const [proveedor, setProveedor] = useState('');

  useEffect(() => {
    if (!targetId) return;
    cargarInventario();
  }, [targetId]);

  const cargarInventario = async () => {
    try {
      setLoading(true);
      const estabRef = doc(db, 'establecimientos', targetId);
      const estabSnap = await getDoc(estabRef);

      if (estabSnap.exists()) {
        const data = estabSnap.data();
        setInventario(data.inventario || []);
      }
    } catch (err) {
      console.error("Error al cargar inventario:", err);
      setErrorMsg('No se pudo cargar el inventario.');
    } finally {
      setLoading(false);
    }
  };

  const guardarInventarioEnFirestore = async (nuevoInventario) => {
    const estabRef = doc(db, 'establecimientos', targetId);
    await updateDoc(estabRef, { inventario: nuevoInventario });
    setInventario(nuevoInventario);
  };

  const handleGuardarProducto = async (e) => {
    e.preventDefault();
    if (!nombre || !precio || !stock) return;

    try {
      let actualizado = [...inventario];

      if (productoEnEdicion) {
        actualizado = actualizado.map(p => {
          if (p.id === productoEnEdicion.id) {
            return {
              ...p,
              nombre,
              categoria,
              costo: Number(costo) || 0,
              precio: Number(precio) || 0,
              stock: Number(stock) || 0,
              stockMinimo: Number(stockMinimo) || 5,
              proveedor
            };
          }
          return p;
        });
        setSuccessMsg('¡Producto actualizado con éxito!');
      } else {
        const nuevoProd = {
          id: 'prod_' + Date.now(),
          nombre,
          categoria,
          costo: Number(costo) || 0,
          precio: Number(precio) || 0,
          stock: Number(stock) || 0,
          stockMinimo: Number(stockMinimo) || 5,
          proveedor,
          createdAt: new Date().toISOString()
        };
        actualizado.push(nuevoProd);
        setSuccessMsg('¡Producto agregado al inventario!');
      }

      await guardarInventarioEnFirestore(actualizado);
      cerrarModalProducto();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Error al guardar producto:", err);
      setErrorMsg('No se pudo guardar el producto.');
    }
  };

  const confirmarEliminacion = async () => {
    if (!productoAEliminar) return;
    try {
      const actualizado = inventario.filter(p => p.id !== productoAEliminar.id);
      await guardarInventarioEnFirestore(actualizado);
      setSuccessMsg('Producto eliminado.');
      setModalEliminarOpen(false);
      setProductoAEliminar(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Error al eliminar producto:", err);
      setErrorMsg('No se pudo eliminar el producto.');
      setModalEliminarOpen(false);
    }
  };

  const abrirEdicion = (prod) => {
    setProductoEnEdicion(prod);
    setNombre(prod.nombre);
    setCategoria(prod.categoria || 'General');
    setCosto(prod.costo || '');
    setPrecio(prod.precio || '');
    setStock(prod.stock || '');
    setStockMinimo(prod.stockMinimo || '5');
    setProveedor(prod.proveedor || '');
    setModalProductoOpen(true);
  };

  const cerrarModalProducto = () => {
    setModalProductoOpen(false);
    setProductoEnEdicion(null);
    setNombre('');
    setCategoria('General');
    setCosto('');
    setPrecio('');
    setStock('');
    setStockMinimo('5');
    setProveedor('');
  };

  const ejecutarMovimientoStock = async (e) => {
    e.preventDefault();
    if (!productoSeleccionado || !cantidadMov) return;

    const cant = Number(cantidadMov);
    if (isNaN(cant) || cant <= 0) return;

    if (tipoMovimiento === 'descargo' && cant > productoSeleccionado.stock) {
      alert('Stock insuficiente para realizar este descargo.');
      return;
    }

    try {
      const actualizado = inventario.map(p => {
        if (p.id === productoSeleccionado.id) {
          const nuevoStock = tipoMovimiento === 'cargo' ? p.stock + cant : p.stock - cant;
          return { ...p, stock: nuevoStock };
        }
        return p;
      });

      await guardarInventarioEnFirestore(actualizado);
      setSuccessMsg(`Stock actualizado (${tipoMovimiento === 'cargo' ? '+' : '-'}${cant} un.).`);
      setModalMovimientoOpen(false);
      setProductoSeleccionado(null);
      setCantidadMov('');
      setMotivoMov('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Error al registrar movimiento:", err);
      setErrorMsg('No se pudo actualizar el stock.');
    }
  };

  const totalItems = inventario.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
  const valorInventario = inventario.reduce((acc, curr) => acc + ((Number(curr.stock) || 0) * (Number(curr.precio) || 0)), 0);
  const alertasStock = inventario.filter(p => (Number(p.stock) || 0) <= (Number(p.stockMinimo) || 5)).length;

  const productosFiltrados = inventario.filter(p => 
    (p.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.categoria || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-12 text-center font-mono text-[11px] text-blue-600 flex flex-col items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        Cargando inventario...
      </div>
    );
  }

  return (
    <div className="space-y-3 font-mono text-[11px] text-slate-800 animate-in fade-in duration-200 pb-10 px-2 sm:px-4">
      
      {/* ALERTAS */}
      {successMsg && (
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-900 text-[10px] flex gap-2 items-center shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 text-rose-900 text-[10px] flex gap-2 items-center shadow-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span className="font-bold">{errorMsg}</span>
        </div>
      )}

      {/* 3 RECUADROS EN COLUMNA DE 3 (UNO AL LADO DE OTRO) */}
      <div className="grid grid-cols-3 gap-2">
        
        {/* Recuadro 1: Valor */}
        <div className="bg-gradient-to-br from-blue-50/90 via-sky-50/50 to-white border border-blue-200/80 p-2.5 rounded-xl flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Valor Total</p>
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-2xs shrink-0">
              <DollarSign className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-[11px] sm:text-sm font-black text-blue-950 truncate">${valorInventario.toLocaleString()}</p>
            <p className="text-[7px] text-slate-500">COP</p>
          </div>
        </div>

        {/* Recuadro 2: Stock */}
        <div className="bg-gradient-to-br from-blue-50/90 via-sky-50/50 to-white border border-blue-200/80 p-2.5 rounded-xl flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Unidades</p>
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-2xs shrink-0">
              <Package className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-[11px] sm:text-sm font-black text-blue-950 truncate">{totalItems} un.</p>
            <p className="text-[7px] text-slate-500">{inventario.length} prod.</p>
          </div>
        </div>

        {/* Recuadro 3: Alertas */}
        <div className="bg-gradient-to-br from-amber-50/90 via-yellow-50/50 to-white border border-amber-200/80 p-2.5 rounded-xl flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[8px] font-bold text-amber-700 uppercase tracking-wider">Stock Bajo</p>
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-2xs shrink-0">
              <AlertTriangle className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-[11px] sm:text-sm font-black text-amber-950 truncate">{alertasStock} alertas</p>
            <p className="text-[7px] text-amber-700">Revisar</p>
          </div>
        </div>

      </div>

      {/* BARRA DE ACCIONES Y FILTROS */}
      <div className="bg-white border border-blue-200/80 rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="relative w-full sm:flex-1">
          <Search className="w-3.5 h-3.5 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Buscar por nombre o categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-blue-50/40 border border-blue-200 rounded-lg pl-9 pr-3 py-1.5 text-[11px] text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition-all placeholder-slate-400 font-mono"
          />
        </div>

        <button
          onClick={() => setModalProductoOpen(true)}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-black px-3.5 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Nuevo Producto
        </button>
      </div>

      {/* TABLA / LISTADO DE INVENTARIO */}
      <div className="bg-white border border-blue-200/80 rounded-xl shadow-2xs overflow-hidden">
        {productosFiltrados.length === 0 ? (
          <div className="p-10 text-center text-slate-400 space-y-1.5">
            <Package className="w-8 h-8 mx-auto opacity-30 text-blue-500" />
            <p className="font-bold text-slate-600 text-[10px]">No hay productos registrados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[550px]">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 via-sky-50 to-blue-50 border-b border-blue-200 text-blue-950 font-black text-[9px] uppercase tracking-wider">
                  <th className="p-3">Producto</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3">Costo</th>
                  <th className="p-3">Precio Venta</th>
                  <th className="p-3 text-center">Stock</th>
                  <th className="p-3">Proveedor</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100 text-[10px]">
                {productosFiltrados.map((prod) => {
                  const esAlerta = Number(prod.stock) <= Number(prod.stockMinimo);
                  return (
                    <tr key={prod.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-3 font-black text-slate-900">
                        {prod.nombre}
                        {esAlerta && (
                          <span className="ml-1.5 bg-amber-100 text-amber-800 border border-amber-300 text-[7px] font-extrabold px-1 py-0.5 rounded uppercase">
                            Bajo
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600 font-bold">{prod.categoria}</td>
                      <td className="p-3 text-slate-500">${Number(prod.costo || 0).toLocaleString()}</td>
                      <td className="p-3 text-blue-700 font-bold">${Number(prod.precio || 0).toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-lg font-black text-[10px] inline-block border ${
                          esAlerta ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {prod.stock} un.
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{prod.proveedor || 'N/A'}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setProductoSeleccionado(prod);
                              setTipoMovimiento('cargo');
                              setModalMovimientoOpen(true);
                            }}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-1.5 rounded-lg border border-emerald-200 cursor-pointer transition-all"
                            title="Registrar Ingreso (Cargo)"
                          >
                            <ArrowUpCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setProductoSeleccionado(prod);
                              setTipoMovimiento('descargo');
                              setModalMovimientoOpen(true);
                            }}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-700 p-1.5 rounded-lg border border-amber-200 cursor-pointer transition-all"
                            title="Registrar Salida (Descargo)"
                          >
                            <ArrowDownCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => abrirEdicion(prod)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-1.5 rounded-lg border border-blue-200 cursor-pointer transition-all"
                            title="Editar Producto"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setProductoAEliminar(prod);
                              setModalEliminarOpen(true);
                            }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-lg border border-rose-200 cursor-pointer transition-all"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CREAR / EDITAR PRODUCTO */}
      {modalProductoOpen && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-blue-200 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
            <div className="px-4 py-3 border-b border-blue-100 bg-blue-50 flex items-center justify-between">
              <h3 className="font-black text-slate-900 uppercase text-xs">
                {productoEnEdicion ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button onClick={cerrarModalProducto} className="w-6 h-6 rounded-lg bg-white border border-blue-200 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-all cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleGuardarProducto} className="p-4 space-y-2.5">
              <div>
                <label className="block font-bold text-slate-700 text-[9px] uppercase mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cera mate"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-600 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 text-[9px] uppercase mb-1">Categoría</label>
                  <input
                    type="text"
                    placeholder="Ej. Barbería"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 text-[9px] uppercase mb-1">Proveedor</label>
                  <input
                    type="text"
                    placeholder="Proveedor"
                    value={proveedor}
                    onChange={(e) => setProveedor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 text-[9px] uppercase mb-1">Costo ($)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={costo}
                    onChange={(e) => setCosto(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 text-[9px] uppercase mb-1">Precio Venta ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 text-[9px] uppercase mb-1">Stock Actual</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 text-[9px] uppercase mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    required
                    placeholder="5"
                    value={stockMinimo}
                    onChange={(e) => setStockMinimo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-600 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={cerrarModalProducto}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg uppercase text-[10px] transition-all border border-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-black py-2 rounded-lg uppercase text-[10px] shadow-md cursor-pointer active:scale-95"
                >
                  {productoEnEdicion ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CARGO / DESCARGO DE STOCK */}
      {modalMovimientoOpen && productoSeleccionado && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-blue-200 rounded-2xl w-full max-w-xs overflow-hidden shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-blue-100 pb-2">
              <h3 className="font-black text-slate-900 uppercase text-xs">
                {tipoMovimiento === 'cargo' ? '📥 Ingreso Stock' : '📤 Salida Stock'}
              </h3>
              <button onClick={() => setModalMovimientoOpen(false)} className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-100 space-y-0.5">
              <p className="font-black text-blue-950 text-xs">{productoSeleccionado.nombre}</p>
              <p className="text-[10px] text-slate-600">Stock actual: <strong className="text-blue-700">{productoSeleccionado.stock} un.</strong></p>
            </div>

            <form onSubmit={ejecutarMovimientoStock} className="space-y-2.5">
              <div>
                <label className="block font-bold text-slate-700 text-[9px] uppercase mb-1">Cantidad</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Ej. 10"
                  value={cantidadMov}
                  onChange={(e) => setCantidadMov(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[9px] uppercase mb-1">Motivo</label>
                <input
                  type="text"
                  placeholder="Ej. Compra / Venta"
                  value={motivoMov}
                  onChange={(e) => setMotivoMov(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-600 font-mono"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setModalMovimientoOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 rounded-lg uppercase text-[10px] border border-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`flex-1 text-white font-black py-2 rounded-lg uppercase text-[10px] shadow-md cursor-pointer active:scale-95 ${
                    tipoMovimiento === 'cargo' 
                      ? 'bg-emerald-600 hover:bg-emerald-700' 
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {modalEliminarOpen && productoAEliminar && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-rose-200 rounded-2xl w-full max-w-xs overflow-hidden shadow-2xl p-4 text-center space-y-3">
            <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-slate-900 uppercase text-xs">Eliminar Producto</h3>
              <p className="text-[10px] text-slate-600">
                ¿Eliminar <strong className="text-slate-900">{productoAEliminar.nombre}</strong>?
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button 
                onClick={() => setModalEliminarOpen(false)}
                className="flex-1 bg-slate-100 text-slate-700 font-bold py-1.5 rounded-lg uppercase text-[9px] border border-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarEliminacion}
                className="flex-1 bg-rose-600 text-white font-black py-1.5 rounded-lg uppercase text-[9px] shadow-md cursor-pointer active:scale-95"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}