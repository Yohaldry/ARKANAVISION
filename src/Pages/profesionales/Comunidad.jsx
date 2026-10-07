import React, { useState, useEffect } from 'react';
import { db, auth } from '../../components/firebase'; 
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function Comunidad() {
  const [referidos, setReferidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [copiado, setCopiado] = useState(false);
  const [usuarioEmail, setUsuarioEmail] = useState('');
  const [barberoSeleccionado, setBarberoSeleccionado] = useState(null);

  const linkReferido = usuarioEmail 
    ? `${window.location.origin}/panelprofesionales?register=true&ref=${encodeURIComponent(usuarioEmail)}`
    : '';

  useEffect(() => {
    const cargarDatosComunidad = async () => {
      const user = auth.currentUser;
      if (!user) {
        setCargando(false);
        return;
      }

      setUsuarioEmail(user.email);

      try {
        const q = query(
          collection(db, "profesionales"), 
          where("ref", "==", user.email)
        );

        const querySnapshot = await getDocs(q);
        const listaReferidos = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setReferidos(listaReferidos);
      } catch (error) {
        console.error("Error al cargar la red de referidos:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatosComunidad();
  }, []);

  const copiarLink = () => {
    if (!linkReferido) return;
    navigator.clipboard.writeText(linkReferido);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 text-slate-800 animate-in fade-in duration-200">
      
      {/* Cabecera de la sección compacta */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-4 text-white shadow-md">
        <h2 className="text-base font-bold mb-1 flex items-center gap-2">
          <span>🤝</span> Comunidad y Referidos
        </h2>
        <p className="text-emerald-100 text-[11px] sm:text-xs max-w-xl">
          Invita a colegas y construye tu red para generar comisiones por cada barbero activo.
        </p>
      </div>

      {/* Tarjeta para compartir enlace */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
          Tu Enlace de Invitación Personal
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            readOnly
            value={linkReferido || "Cargando enlace..."}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-600 focus:outline-none"
          />
          <button
            type="button"
            onClick={copiarLink}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2"
          >
            {copiado ? '¡Copiado! ✓' : 'Copiar Link'}
          </button>
        </div>
        <p className="text-[11px] text-slate-400">
          * Todo barbero que se registre utilizando este enlace quedará vinculado automáticamente a tu red bajo tu correo.
        </p>
      </div>

      {/* Métricas / Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
            👥
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Barberos Invitados</p>
            <h3 className="text-2xl font-black text-slate-900">{referidos.length}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
            💰
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Comisiones Generadas</p>
            <h3 className="text-2xl font-black text-slate-900">$0 <span className="text-xs font-normal text-slate-400">COP</span></h3>
          </div>
        </div>
      </div>

      {/* Mapa Visual Interactivo de la Red en 3 Columnas */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>🗺️ Tu red</span>
          </h3>
          <span className="text-[11px] text-slate-400">Toca un nodo para ver detalles</span>
        </div>

        {cargando ? (
          <div className="py-10 text-center text-slate-400 text-xs">Cargando red de comunidad...</div>
        ) : referidos.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-xl space-y-2">
            <p className="text-3xl">🌱</p>
            <p className="text-slate-600 font-medium text-xs">Aún no tienes barberos invitados en tu red.</p>
            <p className="text-slate-400 text-[11px]">Comparte tu link de registro para empezar a estructurar tu comunidad.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {referidos.map((refUser, index) => (
              <div 
                key={refUser.id || index}
                onClick={() => setBarberoSeleccionado(refUser)}
                className="bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-xl p-3 flex flex-col items-center text-center cursor-pointer transition-all shadow-sm group"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-2 shadow-inner group-hover:scale-105 transition-transform">
                  {(refUser.nombre || refUser.displayName || 'B').charAt(0).toUpperCase()}
                </div>
                
                <h4 className="font-bold text-slate-800 text-xs truncate w-full">
                  {refUser.nombre || refUser.displayName || 'Colega'}
                </h4>
                <p className="text-[10px] text-slate-400 truncate w-full mt-0.5">
                  {refUser.email}
                </p>

                <span className="mt-2 inline-block bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full">
                  Activo
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Información Detallada del Barbero */}
      {barberoSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-black text-slate-900 text-sm">Detalles del Colega</h4>
              <button 
                onClick={() => setBarberoSeleccionado(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {(barberoSeleccionado.nombre || 'B').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">
                    {barberoSeleccionado.nombre || barberoSeleccionado.displayName || 'Sin nombre'}
                  </p>
                  <p className="text-slate-400">{barberoSeleccionado.email}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <p className="text-slate-500">Estado en la red: <span className="font-bold text-emerald-600">Activo</span></p>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => setBarberoSeleccionado(null)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}