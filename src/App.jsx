
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home'; // Mueve tu contenido actual aquí
import Onboarding from './Pages/Onboarding'; // La nueva página
import FaceScanner from './Pages/FaceScanner/FaceScanner'; // SCANNER PARA ASESORIA DE IAMGEN
import Welcome from './Pages/FaceScanner/Welcome'
import ProjectLab from './Pages/iniciarproyect/ProjectLab'
import Arkalogin from './Pages/Login/ArkaLogin'
import Biometricform from './Pages/FaceScanner/BiometricForm'
import IntroduccionLAb from './Pages/iniciarproyect/IntroduccionLab'

function App() {
  return (
<Router>
      <Routes>
        {/* Ruta principal: Tu Landing Page completa */}
        <Route path="/" element={<Home />} />
        
        {/* Ruta de Onboarding: La nueva página de "Pre-Consultoría" */}
        <Route path="/biometricform" element={<Biometricform />} />
         <Route path="/FaceScanner" element={<FaceScanner />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/iniciar-proyecto" element={<IntroduccionLAb/>} />
        <Route path="/login" element={<Arkalogin />} />
        <Route path="/formulario" element={<ProjectLab/>} />
      </Routes>
    </Router>
  );
}

export default App;