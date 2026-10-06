import React, { useState, useEffect } from 'react';
import { db, auth } from '../../components/firebase'; // Ajusta la ruta de tu configuración de Firebase si es necesario
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export default function Comunidad() {
  const [referidos, setReferidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [copiado, setCopiado] = useState(false);
  const [usuarioEmail, setUsuarioEmail] = useState('');

  // Generar link de referido basado en el correo o UID del barbero actual
  const linkReferido = usuarioEmail 
    ? `${window.location.origin}/registro?ref=${encodeURIComponent(usuarioEmail)}`
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
        // Consultar usuarios/barberos registrados cuyo campo 'ref' coincida con el correo del usuario actual
        // (Asegúrate de que al registrarse un nuevo barbero guardes el campo 'ref' con el email o uid del invitador)
        const q = query(
          collection(db, "usuarios"), // O la colección donde guardes los perfiles de los barberos (ej: "barberos", "users")
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
      
      {/* Cabecera de la sección */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-xl font-bold mb-2">🤝 Comunidad y Referidos</h2>
        <p className="text-emerald-100 text-xs sm:text-sm max-w-xl">
          Invita a más colegas barberos a unirse a la plataforma. Comparte tu enlace personal y construye tu red para comenzar a generar comisiones por cada barbero activo.
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

      {/* Mapa Estructurado de la Red */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span>🗺️ Mapa de tu Red (Árbol de Referidos)</span>
        </h3>

        {cargando ? (
          <div className="py-10 text-center text-slate-400 text-xs">Cargando red de comunidad...</div>
        ) : referidos.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-xl space-y-2">
            <p className="text-3xl">🌱</p>
            <p className="text-slate-600 font-medium text-xs">Aún no tienes barberos invitados en tu red.</p>
            <p className="text-slate-400 text-[11px]">Comparte tu link de registro para empezar a estructurar tu comunidad.</p>
          </div>
        ) : (
          <div className="space-y-3 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-100">
            {referidos.map((refUser, index) => (
              <div key={refUser.id || index} className="relative flex items-center gap-3 pl-2">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold z-10 shadow-sm border-2 border-white">
                  {index + 1}
                </div>
                <div className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                      {refUser.nombre || refUser.displayName || 'Barbero Colega'}
                    </h4>
                    <p className="text-[11px] text-slate-500">{refUser.email}</p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    Activo en Red
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}