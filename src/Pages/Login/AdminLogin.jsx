import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Para saltar al Dashboard
import { 
  ShieldCheck, 
  Lock, 
  User, 
  ArrowRight, 
  Terminal,
  Cpu,
  AlertCircle
} from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ user: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

const handleLogin = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);

  try {
    const response = await fetch('https://arkana-server-production.up.railway.app/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: credentials.user,
        password: credentials.password
      }),
    });

    const data = await response.json();

    if (response.ok && data.auth) {
      localStorage.clear(); // Limpiamos para borrar el 'undefined' anterior

      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', data.user);
      
      // GUARDADO DIRECTO: Si el servidor manda siteId, esto lo guarda perfecto.
      localStorage.setItem('siteId', String(data.siteId)); 

      console.log("ID RECUPERADO:", localStorage.getItem('siteId'));

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);

    } else {
      setError(data.message || "CREDENCIALES INCORRECTAS");
    }
  } catch (err) {
    setError("ERROR DE CONEXIÓN");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <LoginWrapper>
      <BackgroundEffects>
        <div className="glow-1" />
        <div className="glow-2" />
      </BackgroundEffects>

      <LoginCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <HeaderSection>
          <LogoContainer>
            <div className="logo-glow" />
            <Cpu size={32} color="#00f7ff" />
          </LogoContainer>
          <Title>ARKANA<span>VISION</span></Title>
          <Badge>
            <ShieldCheck size={10} />
            SISTEMA CENTRAL DE ADMINISTRACIÓN
          </Badge>
        </HeaderSection>

        <Form onSubmit={handleLogin}>
          <InputGroup>
            <label>Identificador de Administrador</label>
            <div className="input-wrapper">
              <User size={18} className="icon" />
              <input 
                type="text" 
                placeholder="root_admin"
                value={credentials.user}
                onChange={(e) => setCredentials({...credentials, user: e.target.value})}
                required 
              />
            </div>
          </InputGroup>

          <InputGroup>
            <label>Clave de Acceso Encriptada</label>
            <div className="input-wrapper">
              <Lock size={18} className="icon" />
              <input 
                type="password" 
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                required 
              />
            </div>
          </InputGroup>

          <AnimatePresence>
            {error && (
              <ErrorMessage initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AlertCircle size={14} /> {error}
              </ErrorMessage>
            )}
            {success && (
              <SuccessMessage initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ShieldCheck size={14} /> {success}
              </SuccessMessage>
            )}
          </AnimatePresence>

          <LoginButton disabled={isLoading}>
            {isLoading ? "VERIFICANDO..." : "INICIAR SESIÓN EN EL CORE"}
            <ArrowRight size={18} />
          </LoginButton>
        </Form>

        <FooterInfo>
          <div className="status"><span className="dot" /> DB_STATUS: ONLINE</div>
          <div className="version">V 2.0.26</div>
        </FooterInfo>
      </LoginCard>

      <SystemTerminal>
        <Terminal size={14} />
        <span>BOG_SERVER_NODE_01: {new Date().toLocaleTimeString()}</span>
      </SystemTerminal>
    </LoginWrapper>
  );
};

// --- ESTILOS (Styled Components) ---
const LoginWrapper = styled.div`
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: #000; position: relative; overflow: hidden; font-family: 'Inter', sans-serif;
`;

const BackgroundEffects = styled.div`
  position: absolute; inset: 0;
  .glow-1 { position: absolute; top: -10%; right: -10%; width: 40%; height: 40%; background: radial-gradient(circle, rgba(0, 247, 255, 0.08) 0%, transparent 70%); }
  .glow-2 { position: absolute; bottom: -10%; left: -10%; width: 40%; height: 40%; background: radial-gradient(circle, rgba(3, 0, 184, 0.1) 0%, transparent 70%); }
`;

const LoginCard = styled(motion.div)`
  width: 100%; max-width: 420px; background: rgba(10, 10, 10, 0.8); backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05); border-top: 1px solid rgba(0, 247, 255, 0.3);
  border-radius: 24px; padding: 40px; z-index: 10; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
`;

const HeaderSection = styled.div` text-align: center; margin-bottom: 35px; `;

const LogoContainer = styled.div`
  position: relative; width: fit-content; margin: 0 auto 15px;
  .logo-glow { position: absolute; inset: 0; background: #00f7ff; filter: blur(20px); opacity: 0.3; }
`;

const Title = styled.h1` color: #fff; font-size: 20px; font-weight: 900; letter-spacing: 2px; span { color: #00f7ff; } `;

const Badge = styled.div`
  display: inline-flex; align-items: center; gap: 6px; background: rgba(0, 247, 255, 0.05);
  border: 1px solid rgba(0, 247, 255, 0.2); color: #00f7ff; padding: 4px 10px; border-radius: 6px;
  font-size: 8px; font-weight: 800; margin-top: 10px;
`;

const Form = styled.form` display: flex; flex-direction: column; gap: 20px; `;

const InputGroup = styled.div`
  display: flex; flex-direction: column; gap: 8px;
  label { font-size: 10px; color: #555; text-transform: uppercase; font-weight: 700; }
  .input-wrapper {
    position: relative; display: flex; align-items: center;
    .icon { position: absolute; left: 15px; color: #333; }
    input {
      width: 100%; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05);
      padding: 14px 14px 14px 45px; border-radius: 12px; color: #fff; font-size: 14px;
      &:focus { outline: none; border-color: #00f7ff; }
    }
  }
`;

const ErrorMessage = styled(motion.div)`
  color: #ff4b4b; font-size: 11px; background: rgba(255, 75, 75, 0.1);
  padding: 10px; border-radius: 8px; display: flex; align-items: center; gap: 8px; border: 1px solid rgba(255, 75, 75, 0.2);
`;

const SuccessMessage = styled(motion.div)`
  color: #00f7ff; font-size: 11px; background: rgba(0, 247, 255, 0.1);
  padding: 10px; border-radius: 8px; display: flex; align-items: center; gap: 8px; border: 1px solid rgba(0, 247, 255, 0.3);
`;

const LoginButton = styled.button`
  background: #00f7ff; color: #000; border: none; padding: 16px; border-radius: 12px;
  font-weight: 900; font-size: 12px; cursor: pointer; display: flex; align-items: center;
  justify-content: center; gap: 10px; transition: 0.3s;
  &:disabled { opacity: 0.5; }
  &:hover:not(:disabled) { transform: scale(1.02); box-shadow: 0 0 20px rgba(0, 247, 255, 0.4); }
`;

const FooterInfo = styled.div`
  margin-top: 30px; display: flex; justify-content: space-between; font-family: monospace; font-size: 9px; color: #333;
  .status { display: flex; align-items: center; gap: 5px; .dot { width: 4px; height: 4px; background: #00f7ff; border-radius: 50%; } }
`;

const SystemTerminal = styled.div`
  position: absolute; bottom: 20px; left: 20px; color: rgba(255, 255, 255, 0.1);
  font-family: monospace; font-size: 10px; display: flex; align-items: center; gap: 8px;
`;

export default AdminLogin;