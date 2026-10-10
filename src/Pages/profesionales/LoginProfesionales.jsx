import React, { useState, useEffect } from 'react';
import { 
  Eye, EyeOff, ArrowRight, Loader2, AlertTriangle, CheckCircle2, ShieldCheck, Zap, Users 
} from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../components/firebase'; // Ajusta la ruta a tu archivo firebase.js si es necesario

export default function LoginProfesionales() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [errorMsgLogin, setErrorMsgLogin] = useState('');
  const [successMsgLogin, setSuccessMsgLogin] = useState('');
  const [transicionVisarka, setTransicionVisarka] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombreRegistro, setNombreRegistro] = useState('');
  const [refInvitador, setRefInvitador] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [pais, setPais] = useState('Colombia');
  const [moneda, setMoneda] = useState('COP');
  const [tipoTrabajador, setTipoTrabajador] = useState('establecimiento'); // 'establecimiento' o 'empleado'
  const [establecimiento, setEstablecimiento] = useState('');
  const [porcentajeEmpleado, setPorcentajeEmpleado] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const referidoParam = queryParams.get('ref');
    const registerParam = queryParams.get('register');
    
    if (referidoParam) {
      setRefInvitador(referidoParam);
    }

    if (registerParam === 'true' || referidoParam) {
      setIsRegistering(true);
    }
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isRegistering && password !== confirmPassword) {
      return setErrorMsgLogin('Las contraseñas no coinciden.');
    }
    if (isRegistering && password.length < 8) {
      return setErrorMsgLogin('La contraseña debe tener al menos 8 caracteres.');
    }
    
    setLoginLoading(true);
    setErrorMsgLogin('');
    
    try {
      if (isRegistering) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        
        if (tipoTrabajador === 'establecimiento') {
          // Guardar en la tabla de establecimientos
          await setDoc(doc(db, 'establecimientos', cred.user.uid), {
            uid: cred.user.uid,
            nombre: establecimiento || nombreRegistro || 'Establecimiento Socio',
            email: cred.user.email,
            pais: pais || 'Colombia',
            moneda: moneda || 'COP',
            tipo: 'establecimiento',
            ref: refInvitador || 'yohaldryquintero1995@gmail.com',
            createdAt: new Date().toISOString()
          });
        } else {
          // Guardar en la tabla de profesionales (empleados)
          await setDoc(doc(db, 'profesionales', cred.user.uid), { 
            uid: cred.user.uid, 
            nombre: nombreRegistro || 'Socio', 
            email: cred.user.email,
            pais: pais || 'Colombia',
            moneda: moneda || 'COP',
            tipoTrabajador: tipoTrabajador,
            establecimiento: '',
            porcentaje: Number(porcentajeEmpleado) || 0, 
            ref: refInvitador || 'yohaldryquintero1995@gmail.com',
            createdAt: new Date().toISOString()
          });
        }

        setSuccessMsgLogin('¡Registro exitoso!');
        setTransicionVisarka(true);
        setTimeout(() => {
          if (tipoTrabajador === 'establecimiento') {
            window.location.href = '/panelestablecimientos';
          } else {
            window.location.href = '/panelprofesionales';
          }
        }, 1500);
      } else { 
        const cred = await signInWithEmailAndPassword(auth, email, password); 
        
        // Verificar si el usuario pertenece a la tabla de establecimientos
        const estabDocRef = doc(db, 'establecimientos', cred.user.uid);
        const estabSnap = await getDoc(estabDocRef);

        setSuccessMsgLogin('¡Éxito! Redirigiendo...');
        setTransicionVisarka(true);

        setTimeout(() => {
          if (estabSnap.exists()) {
            window.location.href = '/panelestablecimientos';
          } else {
            window.location.href = '/panelprofesionales'; 
          }
        }, 1000);
      }
    } catch (err) { 
      console.error(err);
      setErrorMsgLogin(err.message || 'Verifica tus datos o conexión.');
      setLoginLoading(false);
      setTransicionVisarka(false);
    } finally {
      if (!isRegistering) {
        setLoginLoading(false); 
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 flex items-center justify-center p-3 sm:p-6 font-sans text-slate-800 relative select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.15),transparent_50%)] pointer-events-none"></div>

      {/* Contenedor Principal Adaptable */}
      <div className={`w-full max-w-4xl bg-white/95 border border-blue-100 shadow-[0_20px_50px_rgba(37,99,235,0.12)] rounded-3xl overflow-hidden flex flex-col md:flex-row transition-all duration-700 ease-in-out relative z-10 ${
        isRegistering ? 'md:flex-row-reverse' : ''
      }`}>
        
        {/* Panel de Presentación de la Empresa */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-600 via-sky-600 to-indigo-700 p-5 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden transition-all duration-700 ease-in-out">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="space-y-3 sm:space-y-4 relative z-10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl overflow-hidden bg-white shadow-md flex items-center justify-center p-2">
              <img 
                src="https://res.cloudinary.com/dtkirmtfq/image/upload/v1791241981/Visarka/mxmsobksbvrii384mlja.png" 
                alt="Logo VISARKA" 
                className="w-full h-full object-contain"
              />
            </div>
            
            <div className="space-y-1">
              <span className="text-[8px] sm:text-[9px] font-mono tracking-widest uppercase bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm text-sky-100">
                Portal de Profesionales y Establecimientos
              </span>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight leading-tight">
                VISARKA
              </h1>
              <p className="text-[10px] sm:text-[11px] text-sky-100/90 leading-relaxed max-w-sm">
                Plataforma integral de gestión de citas y control de comisiones diseñada para potenciar tu rendimiento profesional.
              </p>
            </div>
          </div>

          <div className="hidden sm:block space-y-2.5 pt-6 relative z-10">
            <div className="flex items-center gap-2.5 text-[11px] text-sky-100/90">
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Zap size={13} className="text-sky-300" />
              </div>
              <span>Control en tiempo real de servicios y ganancias</span>
            </div>
            <div className="flex items-center gap-2.5 text-[11px] text-sky-100/90">
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <ShieldCheck size={13} className="text-sky-300" />
              </div>
              <span>Seguridad garantizada en cada acceso</span>
            </div>
            <div className="flex items-center gap-2.5 text-[11px] text-sky-100/90">
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Users size={13} className="text-sky-300" />
              </div>
              <span>Red de referidos y comisiones automatizadas</span>
            </div>
          </div>
        </div>

        {/* Panel del Formulario */}
        <div className={`w-full md:w-1/2 p-4 sm:p-6 flex flex-col justify-between bg-white transition-all duration-700 ease-in-out ${isRegistering ? 'max-h-[580px] md:max-h-none overflow-y-auto' : ''}`}>
          <div>
            <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-blue-50 mb-3">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                  {isRegistering ? 'Crear Cuenta Nueva' : 'Iniciar Sesión'}
                </h3>
                <p className="text-[9px] text-slate-400">
                  {isRegistering ? 'Completa tus datos para unirte' : 'Ingresa tus credenciales para continuar'}
                </p>
              </div>
            </div>

            {errorMsgLogin && (
              <div className="p-2 mb-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[10px] flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsgLogin}</span>
              </div>
            )}

            {successMsgLogin && (
              <div className="p-2 mb-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="font-bold">{successMsgLogin}</span>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-2">
              {isRegistering && (
                <div className="space-y-0.5">
                  <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nombre Completo</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ej. Carlos Pérez" 
                    value={nombreRegistro} 
                    onChange={e => setNombreRegistro(e.target.value)} 
                    className="w-full bg-blue-50/40 border border-blue-200/80 rounded-lg py-1.5 px-2.5 text-[11px] text-slate-800 outline-none focus:border-sky-500 focus:bg-white transition-all placeholder-slate-400" 
                  />
                </div>
              )}

              <div className="space-y-0.5">
                <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider ml-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  required 
                  placeholder="correo@dominio.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="w-full bg-blue-50/40 border border-blue-200/80 rounded-lg py-1.5 px-2.5 text-[11px] text-slate-800 outline-none focus:border-sky-500 focus:bg-white transition-all placeholder-slate-400" 
                />
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-0.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Contraseña</label>
                  {password.length > 0 && (
                    <span className={`text-[8px] font-bold ${password.length >= 8 ? 'text-emerald-600' : 'text-amber-500'}`}>
                      {password.length >= 8 ? '✓ Mínimo 8 caracteres' : `Faltan ${8 - password.length} caracteres`}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    placeholder="Mínimo 8 caracteres" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className={`w-full bg-blue-50/40 border rounded-lg py-1.5 pl-2.5 pr-8 text-[11px] text-slate-800 outline-none transition-all placeholder-slate-400 ${
                      password.length > 0 
                        ? password.length >= 8 
                          ? 'border-emerald-500 bg-emerald-50/10 focus:border-emerald-600' 
                          : 'border-amber-400 bg-amber-50/10 focus:border-amber-500' 
                        : 'border-blue-200/80 focus:border-sky-500 focus:bg-white'
                    }`} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              {/* Campo Confirmar Contraseña */}
              {isRegistering && (
                <div className="space-y-0.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Confirmar Contraseña</label>
                    {confirmPassword.length > 0 && (
                      <span className={`text-[8px] font-bold ${password === confirmPassword ? 'text-emerald-600' : 'text-red-500'}`}>
                        {password === confirmPassword ? '✓ Coinciden' : '✕ No coinciden'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      required 
                      placeholder="Repite tu contraseña" 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      className={`w-full bg-blue-50/40 border rounded-lg py-1.5 pl-2.5 pr-8 text-[11px] text-slate-800 outline-none transition-all placeholder-slate-400 ${
                        confirmPassword.length > 0 
                          ? password === confirmPassword 
                            ? 'border-emerald-500 bg-emerald-50/10 focus:border-emerald-600' 
                            : 'border-red-400 bg-red-50/10 focus:border-red-500' 
                          : 'border-blue-200/80 focus:border-sky-500 focus:bg-white'
                      }`} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 cursor-pointer transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
              )}

              {isRegistering && (
                <div className="space-y-0.5">
                  <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                    País y Moneda
                  </label>
                  <select
                    value={pais}
                    onChange={e => {
                      const paisSeleccionado = e.target.value;
                      setPais(paisSeleccionado);
                      if (paisSeleccionado === 'Colombia') {
                        setMoneda('COP');
                      } else {
                        setMoneda('USD');
                      }
                    }}
                    className="w-full bg-blue-50/40 border border-blue-200/80 rounded-lg py-1.5 px-2.5 text-[11px] text-slate-800 outline-none focus:border-sky-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="Colombia">Colombia (COP)</option>
                    <option value="Venezuela">Venezuela (USD)</option>
                    <option value="Estados Unidos (EE.UU.)">Estados Unidos (EE.UU.) (USD)</option>
                  </select>
                </div>
              )}

              {isRegistering && (
                <div className="space-y-1 pt-0.5">
                  <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                    Tipo de Trabajador
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTipoTrabajador('establecimiento')}
                      className={`py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all border cursor-pointer ${
                        tipoTrabajador === 'establecimiento'
                          ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white border-blue-500 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Establecimiento
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoTrabajador('empleado')}
                      className={`py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all border cursor-pointer ${
                        tipoTrabajador === 'empleado'
                          ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white border-blue-500 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Empleado
                    </button>
                  </div>
                </div>
              )}

              {/* Campo dinámico si es Establecimiento */}
              {isRegistering && tipoTrabajador === 'establecimiento' && (
                <div className="space-y-0.5 animate-in fade-in duration-200">
                  <label className="block text-[8px] font-bold text-sky-700 uppercase tracking-wider ml-1">
                    Nombre del Establecimiento
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ej. Barbería Lords VIP" 
                    value={establecimiento} 
                    onChange={e => setEstablecimiento(e.target.value)} 
                    className="w-full bg-sky-50/50 border border-sky-200 rounded-lg py-1.5 px-2.5 text-[11px] text-slate-800 outline-none focus:border-sky-500 focus:bg-white font-bold text-sky-700 placeholder-slate-400" 
                  />
                </div>
              )}

              {/* Campo dinámico si es Empleado */}
              {isRegistering && tipoTrabajador === 'empleado' && (
                <div className="space-y-0.5 animate-in fade-in duration-200">
                  <label className="block text-[8px] font-bold text-sky-700 uppercase tracking-wider ml-1">
                    Porcentaje de Comisión / Ganancia (%)
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    required 
                    placeholder="Ej. 50" 
                    value={porcentajeEmpleado} 
                    onChange={e => setPorcentajeEmpleado(e.target.value)} 
                    className="w-full bg-sky-50/50 border border-sky-200 rounded-lg py-1.5 px-2.5 text-[11px] text-slate-800 outline-none focus:border-sky-500 focus:bg-white font-bold text-sky-700" 
                  />
                </div>
              )}

              {isRegistering && (
                <div className="space-y-0.5">
                  <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                    Patrocinador <span className="text-slate-400 font-normal">(Opcional)</span>
                  </label>
                  <input 
                    type="email" 
                    value={refInvitador} 
                    onChange={e => setRefInvitador(e.target.value)}
                    placeholder="yohaldryquintero1995@gmail.com"
                    className="w-full bg-blue-50/40 border border-blue-200/80 rounded-lg py-1.5 px-2.5 text-[11px] text-slate-600 outline-none focus:border-sky-500 focus:bg-white" 
                  />
                </div>
              )}

              <button 
                type="submit" 
                disabled={loginLoading} 
                className="w-full bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-2 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-sky-500/20 transition-all active:scale-95 mt-2"
              >
                {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{isRegistering ? 'Registrarse' : 'Acceder'} <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>

          <div className="pt-2.5 mt-2.5 border-t border-slate-100 text-center">
            <button 
              type="button" 
              onClick={() => { setIsRegistering(!isRegistering); setErrorMsgLogin(''); setSuccessMsgLogin(''); }} 
              className="text-[10px] font-bold text-slate-500 hover:text-sky-600 transition-colors cursor-pointer"
            >
              {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
            </button>
          </div>
        </div>

      </div>

      {/* Pantalla de Transición Fluida Visarka */}
      {transicionVisarka && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-xl flex items-center justify-center p-2.5 mb-4 animate-pulse">
            <img 
              src="https://res.cloudinary.com/dtkirmtfq/image/upload/v1791241981/Visarka/mxmsobksbvrii384mlja.png" 
              alt="VISARKA" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-white text-sm font-black uppercase tracking-widest">Visarka</h1>
          <p className="text-sky-400 text-[10px] font-mono tracking-wider mt-1">Cargando Panel...</p>
          <div className="w-32 h-1 bg-slate-800 rounded-full mt-6 overflow-hidden border border-sky-900">
            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-sky-400 animate-[indeterminate_1s_infinite_linear]"></div>
          </div>
        </div>
      )}
    </div>
  );
}