import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './components/firebase';
import AdminLogin from './Pages/Login/AdminLogin';
import Home from './Pages/Home';
import Facescanner from './Pages/FaceScanner/FaceScanner';
import Test from './Pages/FaceScanner/IA_Voice/AnalisisVentas';
import ResultsScanner from './Pages/FaceScanner/ResultsScanner';
import PanelDeControl from './Pages/FaceScanner/PanelDeControl';
import LoginScanner from './Pages/Login/LoginScanner';
import Welcome from './Pages/FaceScanner/Welcome';
import BiometricForm from './Pages/FaceScanner/BiometricForm';
import Admin from './Pages/AdminDashboard/Admin';
import BarberoLintero from './Pages/barberos/BarberoKintero';
import PanelProfesionales from './Pages/profesionales/PanelProfesionales';
import BarberBookingView from './Pages/profesionales/BarberBookingView';
import LoginProfesionales from './Pages/profesionales/LoginProfesionales';
import PanelEstablecimientos from './Pages/profesionales/establecimientos/PanelEstablecimientos';
import AgendaEstablecimiento from './Pages/profesionales/establecimientos/AgendaEstablecimiento';

// Ruta protegida para profesionales: evita acceso mediante links de referidos a usuarios no autenticados
const ProtectedProfRoute = ({ children }) => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuth(!!user);
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  if (checkingAuth) {
    return (
      <div className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center animate-in fade-in duration-300 select-none">
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border border-blue-200 shadow-xl flex items-center justify-center p-2.5 mb-4 animate-pulse">
          <img 
            src="https://res.cloudinary.com/dtkirmtfq/image/upload/v1791241981/Visarka/mxmsobksbvrii384mlja.png" 
            alt="VISARKA" 
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-slate-900 text-xs font-black uppercase tracking-widest">VISARKA</h1>
        <p className="text-blue-600 text-[10px] font-mono tracking-wider mt-1">Verificando sesión segura...</p>
        <div className="w-32 h-1 bg-blue-100 rounded-full mt-6 overflow-hidden">
          <div className="w-full h-full bg-blue-600 animate-[indeterminate_1s_infinite_linear]"></div>
        </div>
      </div>
    );
  }

  return isAuth ? children : <Navigate to="/loginprofesionales" replace />;
};

// Ruta protegida para establecimientos: asegura que solo usuarios autenticados accedan al panel
const ProtectedEstablecimientoRoute = ({ children }) => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuth(!!user);
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  if (checkingAuth) {
    return (
      <div className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center animate-in fade-in duration-300 select-none">
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border border-blue-200 shadow-xl flex items-center justify-center p-2.5 mb-4 animate-pulse">
          <img 
            src="https://res.cloudinary.com/dtkirmtfq/image/upload/v1791241981/Visarka/mxmsobksbvrii384mlja.png" 
            alt="VISARKA" 
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-slate-900 text-xs font-black uppercase tracking-widest">VISARKA</h1>
        <p className="text-blue-600 text-[10px] font-mono tracking-wider mt-1">Verificando acceso al establecimiento...</p>
        <div className="w-32 h-1 bg-blue-100 rounded-full mt-6 overflow-hidden">
          <div className="w-full h-full bg-blue-600 animate-[indeterminate_1s_infinite_linear]"></div>
        </div>
      </div>
    );
  }

  // Nota: Cambia "/loginestablecimientos" por la ruta real de tu login de establecimientos si es diferente
  return isAuth ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/loginadmin" element={<AdminLogin />} />
        <Route path="/test" element={<Test />} />
        
        <Route path="/" element={<Home />} />
        <Route path="/biometricform" element={<BiometricForm />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/facescanner" element={<Facescanner />} />
        <Route path="/Resultscanner" element={<ResultsScanner />} />
        <Route path="/paneldecontrol" element={<PanelDeControl />} />
        <Route path="/loginscanner" element={<LoginScanner />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/kintero" element={<BarberoLintero />} />
        
        {/* Panel de profesionales protegido estrictamente contra accesos no autorizados */}
        <Route 
          path="/panelprofesionales" 
          element={
            <ProtectedProfRoute>
              <PanelProfesionales />
            </ProtectedProfRoute>
          } 
        />

        <Route path="/loginprofesionales" element={<LoginProfesionales />} />
        
        {/* Panel de establecimientos protegido */}
        <Route 
          path="/panelestablecimientos" 
          element={
            <ProtectedEstablecimientoRoute>
              <PanelEstablecimientos />
            </ProtectedEstablecimientoRoute>
          } 
        />
        
        <Route path="/agendaestablecimiento" element={<AgendaEstablecimiento />} />

        {/* Ruta dinámica para que cada cliente reserve con su barbero respectivo */}
        <Route path="/reservar/:barberoId" element={<BarberBookingView />} />

        {/* Si escriben cualquier otra cosa, redirige al Home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;