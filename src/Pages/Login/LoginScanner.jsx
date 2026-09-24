import React, { useState } from 'react';
import styled from 'styled-components';
import { IoScanOutline, IoLockClosedOutline, IoPersonOutline, IoEyeOutline, IoEyeOffOutline, IoMailOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom'; // <-- NUEVO: Para la redirección automática

// Importación de ambos servicios de autenticación
import { loginProfesionalConDB, registrarProfesionalConDB } from '../../../firebase/authService';

/* ==========================================================================
   STYLED COMPONENTS - INTERFAZ RESPONSIVA PREMIUM (DISEÑO INTEGRAL CONSERVADO)
   ========================================================================== */

const LoginContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #050912;
  display: flex;
  font-family: 'Inter', 'Manrope', sans-serif;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  @media (min-width: 1024px) {
    grid-template-columns: 45% 55%;
  }
`;

const BrandPanel = styled.div`
  display: none;
  background: linear-gradient(135deg, #07111F 0%, #0A1322 100%);
  border-right: 1px solid rgba(22, 119, 255, 0.1);
  position: relative;
  overflow: hidden;
  padding: 48px;
  flex-direction: column;
  justify-content: space-between;

  @media (min-width: 768px) {
    display: flex;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba(0, 229, 255, 0.02) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0, 229, 255, 0.02) 1px, transparent 1px);
    background-size: 30px 30px;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    width: 300px;
    height: 300px;
    top: 20%;
    left: -20%;
    background: radial-gradient(circle, rgba(142, 61, 238, 0.15) 0%, transparent 70%);
    pointer-events: none;
  }

  .brand-header {
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 5;
    
    .logo-text {
      font-family: 'Sora', sans-serif;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 4px;
      background: linear-gradient(90deg, #00E5FF, #1677FF);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  .center-graphics {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 24px;
    z-index: 5;
    margin: auto 0;

    .scanner-holo {
      width: 160px;
      height: 160px;
      border-radius: 40px;
      border: 1px solid rgba(0, 229, 255, 0.2);
      background: rgba(5, 9, 18, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #00E5FF;
      position: relative;
      box-shadow: 0 0 30px rgba(0, 229, 255, 0.05);
      animation: floatGlow 4s ease-in-out infinite;

      &::after {
        content: '';
        position: absolute;
        width: 80%;
        height: 2px;
        background: linear-gradient(90deg, transparent, #00E5FF, transparent);
        top: 20%;
        animation: scanLine 2.5s ease-in-out infinite;
        box-shadow: 0 0 10px #00E5FF;
      }
    }

    h1 {
      font-family: 'Sora', sans-serif;
      font-size: 28px;
      font-weight: 600;
      margin: 12px 0 0 0;
      line-height: 1.3;
      
      span {
        background: linear-gradient(90deg, #00E5FF, #8E3DEE);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    p {
      color: #8B9CB6;
      font-size: 14px;
      max-width: 320px;
      line-height: 1.5;
      margin: 0;
    }
  }

  .brand-footer {
    font-size: 11px;
    color: rgba(139, 156, 182, 0.4);
    z-index: 5;
    letter-spacing: 0.5px;
  }

  @keyframes floatGlow {
    0%, 100% { transform: translateY(0); box-shadow: 0 0 30px rgba(0, 229, 255, 0.05); }
    50% { transform: translateY(-6px); box-shadow: 0 0 40px rgba(0, 229, 255, 0.15); border-color: rgba(0, 229, 255, 0.4); }
  }

  @keyframes scanLine {
    0%, 100% { top: 15%; opacity: 0.3; }
    50% { top: 85%; opacity: 1; }
  }
`;

const FormPanel = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  z-index: 10;
  position: relative;

  @media (max-width: 767px) {
    &::before {
      content: '';
      position: absolute;
      width: 250px;
      height: 250px;
      top: -5%;
      left: -5%;
      background: radial-gradient(circle, rgba(0, 229, 255, 0.12) 0%, transparent 70%);
    }
  }
`;

const LoginCard = styled.div`
  width: 100%;
  max-width: 420px;
  background: linear-gradient(135deg, rgba(10, 19, 34, 0.8) 0%, rgba(7, 17, 31, 0.9) 100%);
  border: 1px solid rgba(22, 119, 255, 0.15);
  border-radius: 28px;
  padding: 36px 32px;
  box-sizing: border-box;
  backdrop-filter: blur(16px);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 480px) {
    padding: 32px 20px;
    border-radius: 24px;
    background: transparent;
    border: none;
    box-shadow: none;
    backdrop-filter: none;
  }
`;

const MobileHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  text-align: center;

  @media (min-width: 768px) {
    margin-bottom: 20px;
  }

  .brand-logo {
    font-family: 'Sora', sans-serif;
    font-size: 32px;
    font-weight: 700;
    letter-spacing: 8px;
    background: linear-gradient(90deg, #00E5FF, #1677FF, #8E3DEE);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 20px rgba(0, 229, 255, 0.25);
    margin-left: 8px;
    
    @media (min-width: 768px) {
      font-size: 28px;
      letter-spacing: 4px;
    }
  }

  .tagline {
    font-size: 11px;
    color: #8B9CB6;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-weight: 500;
  }
`;

/* Selector Estilizado de Pestañas */
const TabNavigator = styled.div`
  display: flex;
  width: 100%;
  background: rgba(5, 9, 18, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
  box-sizing: border-box;
`;

const TabButton = styled.button`
  flex: 1;
  background: ${props => props.active ? 'linear-gradient(90deg, rgba(0, 229, 255, 0.15), rgba(22, 119, 255, 0.15))' : 'transparent'};
  border: ${props => props.active ? '1px solid rgba(0, 229, 255, 0.25)' : '1px solid transparent'};
  color: ${props => props.active ? '#00E5FF' : '#8B9CB6'};
  font-family: 'Sora', sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    color: #FFFFFF;
  }
`;

const LoginForm = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;

  label {
    font-size: 11px;
    font-weight: 600;
    color: #8B9CB6;
    letter-spacing: 0.8px;
    padding-left: 2px;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  .input-icon {
    position: absolute;
    left: 16px;
    font-size: 18px;
    color: rgba(139, 156, 182, 0.4);
    transition: color 0.2s;
  }

  .toggle-password {
    position: absolute;
    right: 16px;
    font-size: 18px;
    color: rgba(139, 156, 182, 0.4);
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: #00E5FF;
    }
  }
`;

const StyledInput = styled.input`
  width: 100%;
  background: rgba(5, 9, 18, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 14px 16px 14px 46px;
  box-sizing: border-box;
  color: #FFFFFF;
  font-size: 14px;
  transition: all 0.2s ease-in-out;

  &::placeholder {
    color: rgba(139, 156, 182, 0.3);
  }

  &:focus {
    outline: none;
    border-color: #1677FF;
    background: rgba(5, 9, 18, 0.8);
    box-shadow: 0 0 12px rgba(22, 119, 255, 0.15);
    
    & ~ .input-icon {
      color: #00E5FF;
    }
  }
`;

const OptionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 12px;
  margin-top: -2px;

  .remember-me {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #8B9CB6;
    cursor: pointer;
    user-select: none;

    input {
      accent-color: #1677FF;
      cursor: pointer;
    }
  }

  .forgot-password {
    color: #00E5FF;
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.2s;

    &:hover {
      text-shadow: 0 0 8px rgba(0, 229, 255, 0.4);
      opacity: 0.9;
    }
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  background: linear-gradient(90deg, #00E5FF, #1677FF, #8E3DEE);
  border: none;
  border-radius: 14px;
  padding: 16px;
  color: #FFFFFF;
  font-family: 'Sora', sans-serif;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 1px;
  cursor: pointer;
  margin-top: 4px;
  box-shadow: 0 0 20px rgba(22, 119, 255, 0.25);
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 25px rgba(0, 229, 255, 0.45);
  }

  &:disabled {
    background: rgba(139, 156, 182, 0.2);
    color: rgba(139, 156, 182, 0.5);
    box-shadow: none;
    cursor: not-allowed;
    transform: none;
  }
`;

const FooterText = styled.p`
  font-size: 11px;
  color: rgba(139, 156, 182, 0.5);
  margin-top: 24px;
  text-align: center;
  line-height: 1.5;

  span {
    color: #8E3DEE;
    font-weight: 600;
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

/* NUEVO STYLED-COMPONENT: Alerta flotante dinámica integrada con la estética de Visarka */
const FeedbackMessage = styled.div`
  width: 100%;
  text-align: center;
  font-size: 12px;
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  padding: 12px;
  border-radius: 12px;
  box-sizing: border-box;
  margin-bottom: 8px;
  transition: all 0.3s ease-in-out;
  
  background: ${props => props.type === 'exito' ? 'rgba(6, 78, 59, 0.4)' : 'rgba(153, 27, 27, 0.4)'};
  color: ${props => props.type === 'exito' ? '#34d399' : '#f87171'};
  border: 1px solid ${props => props.type === 'exito' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)'};
  box-shadow: ${props => props.type === 'exito' ? '0 0 15px rgba(52, 211, 153, 0.15)' : '0 0 15px rgba(248, 113, 113, 0.15)'};
`;

/* ==========================================================================
   LOGIC CORE
   ========================================================================= */

const LoginScanner = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState('login'); // Control de pestaña activo
  const navigate = useNavigate(); // Hook de navegación nativo
  
  // Estados para formulario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // NUEVOS ESTADOS: Control dinámico de alertas visuales en UI
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState(''); // 'exito' o 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedbackText(''); // Reseteamos mensajes previos en cada envío

    if (activeTab === 'login') {
      const resultado = await loginProfesionalConDB(email, password);

      if (resultado.success) {
        // 🟢 Éxito: Pintamos en Verde "Verificado"
        setFeedbackType('exito');
        setFeedbackText('Verificado');
        
        console.log("Acceso de profesional verificado exitosamente.");
        if (onLoginSuccess) onLoginSuccess(resultado.userData);

        // Aguantamos 1.5 segundos con el feedback verde neón en UI antes de redirigir
        setTimeout(() => {
          setLoading(false);
          navigate(`/paneldecontrol?id=${resultado.uid}`);
        }, 1500);

      } else {
        // 🔴 Error: Pintamos en Rojo el texto solicitado
        setFeedbackType('error');
        setFeedbackText('Datos incorrectos o registrate');
        setLoading(false);
      }
    } else {
      // Flujo dinámico de Registro
      const nuevoUsuario = { nombre, apellido, email, password };
      const resultado = await registrarProfesionalConDB(nuevoUsuario);

      if (resultado.success) {
        setFeedbackType('exito');
        setFeedbackText('¡Registro exitoso! Redirigiendo...');
        
        if (onLoginSuccess) onLoginSuccess(resultado.userData);

        setTimeout(() => {
          setLoading(false);
          navigate(`/paneldecontrol?id=${resultado.uid}`);
        }, 1500);
      } else {
        setFeedbackType('error');
        setFeedbackText(`Error al registrar: ${resultado.error}`);
        setLoading(false);
      }
    }
  };

  return (
    <LoginContainer>
      
      {/* PANEL IZQUIERDO (PC / Tablets) */}
      <BrandPanel>
        <div className="brand-header">
          <IoScanOutline size={22} color="#00E5FF" />
          <span className="logo-text">VISARKA</span>
        </div>

        <div className="center-graphics">
          <div className="scanner-holo">
            <IoScanOutline size={64} />
          </div>
          <h1>Terminal de <span>Análisis Estético</span></h1>
          <p>Ingresa para desplegar las herramientas avanzadas de visagismo y mapeo facial digital en tiempo real.</p>
        </div>

        <div className="brand-footer">
          Ecosistema Pro • ARKANA Core v2.0
        </div>
      </BrandPanel>

      {/* PANEL DERECHO (Formulario Adaptable) */}
      <FormPanel>
        <LoginCard>
          
          <MobileHeader>
            <div className="brand-logo">VISARKA</div>
            <div className="tagline">Scanner & Visagismo Profesional</div>
          </MobileHeader>

          {/* Controlador de Pestañas */}
          <TabNavigator>
            <TabButton 
              type="button" 
              active={activeTab === 'login'} 
              onClick={() => !loading && setActiveTab('login')}
            >
              INICIAR SESIÓN
            </TabButton>
            <TabButton 
              type="button" 
              active={activeTab === 'registro'} 
              onClick={() => !loading && setActiveTab('registro')}
            >
              REGISTRARSE
            </TabButton>
          </TabNavigator>

          <LoginForm onSubmit={handleSubmit}>
            
            {/* Campos de Nombre y Apellido: Solo se renderizan si está en modo registro */}
            {activeTab === 'registro' && (
              <>
                <InputGroup>
                  <label htmlFor="nombre">NOMBRE</label>
                  <InputWrapper>
                    <IoPersonOutline className="input-icon" />
                    <StyledInput 
                      id="nombre"
                      type="text" 
                      placeholder="Tu nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </InputWrapper>
                </InputGroup>

                <InputGroup>
                  <label htmlFor="apellido">APELLIDO</label>
                  <InputWrapper>
                    <IoPersonOutline className="input-icon" />
                    <StyledInput 
                      id="apellido"
                      type="text" 
                      placeholder="Tu apellido"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </InputWrapper>
                </InputGroup>
              </>
            )}

            {/* Campo Email común */}
            <InputGroup>
              <label htmlFor="email">EMAIL DE CONSULTOR</label>
              <InputWrapper>
                <IoMailOutline className="input-icon" />
                <StyledInput 
                  id="email"
                  type="email" 
                  placeholder="ejemplo@visarka.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </InputWrapper>
            </InputGroup>

            {/* Campo Password común */}
            <InputGroup>
              <label htmlFor="password">CONTRASEÑA</label>
              <InputWrapper>
                <IoLockClosedOutline className="input-icon" />
                <StyledInput 
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <div 
                  className="toggle-password" 
                  onClick={() => !loading && setShowPassword(!showPassword)}
                >
                  {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                </div>
              </InputWrapper>
            </InputGroup>

            {/* Recordar terminal / Recuperación: Exclusivos del Login */}
            {activeTab === 'login' && (
              <OptionsRow>
                <label className="remember-me">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  Recordar terminal
                </label>
                <a href="#recuperar" className="forgot-password">
                  ¿Olvidaste tu clave?
                </a>
              </OptionsRow>
            )}

            {/* Inyección del Feedback Dinámico arriba del botón */}
            {feedbackText && (
              <FeedbackMessage type={feedbackType}>
                {feedbackText}
              </FeedbackMessage>
            )}

            {/* Botón con Texto y Feedback Cambiante */}
            <SubmitButton type="submit" disabled={loading}>
              {loading 
                ? "PROCESANDO CON CORE..." 
                : activeTab === 'login' ? "INGRESAR AL SCANNER" : "CREAR NUEVA CUENTA"
              }
            </SubmitButton>

          </LoginForm>

          <FooterText>
            Desarrollado para consultores de imagen. <br />
            Ecosistema <span>VISARKA Core v2.0</span>
          </FooterText>

        </LoginCard>
      </FormPanel>

    </LoginContainer>
  );
};

export default LoginScanner;