import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './Pages/Login/AdminLogin';
import Home from './Pages/Home'
import Facescanner from './Pages/FaceScanner/FaceScanner'
import Test from './Pages/FaceScanner/IA_Voice/AnalisisVentas'
import ResultsScanner from './Pages/FaceScanner/ResultsScanner'
import PanelDeControl from './Pages/FaceScanner/PanelDeControl'
import LoginScanner from './Pages/Login/LoginScanner'
import Welcome from './Pages/FaceScanner/Welcome'
import BiometricForm from './Pages/FaceScanner/BiometricForm'
import Admin from './Pages/AdminDashboard/Admin'
import BarberoLintero from './Pages/barberos/BarberoKintero'
import PanelProfesionales from './Pages/profesionales/PanelProfesionales';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
  return isAuthenticated ? children : <Navigate to="/" />;
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
         <Route path="/panelprofesionales" element={<PanelProfesionales />} />

        {/* Si escriben cualquier otra cosa, redirige al Home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;