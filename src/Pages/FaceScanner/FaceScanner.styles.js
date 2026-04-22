import styled, { keyframes, css } from 'styled-components';

// Paleta ARKA: Mantenemos la identidad premium
const theme = {
  bg: '#030303', // Un negro aún más profundo para el fondo animado
  arkaDark: '#0D0D0D', // Metal oscuro del chasis
  arkaAccent: '#00E5FF', // Cyan eléctrico
  arkaSilver: '#E0E0E0',
  arkaGlass: 'rgba(10, 12, 12, 0.97)', // Sidebar más opaco para legibilidad
  textMain: '#FFFFFF',
  textDim: '#555555',
};

// --- KEYFRAMES PARA MOVIMIENTOS FUTURISTAS ---

// 1. Movimiento de parpadeo y viaje estelar para el fondo
const starTravel = keyframes`
  0% { transform: translateY(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-1000px); opacity: 0; }
`;

// 2. Movimiento de la línea láser de escaneo (Ya lo teníamos)
const scanMove = keyframes`
  0% { top: -2%; opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { top: 102%; opacity: 0; }
`;

// 3. Pulso sutil de los elementos HUD de ARKA
const hudPulse = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
`;

// --- COMPONENTES ESTILIZADOS ---

export const ScannerContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: ${theme.bg};
  overflow: hidden;
  font-family: 'Inter', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;

  /* --- EFECTO DE FONDO: RED NEURONAL / VIAJE ESTELAR --- */
  &::before, &::after {
    content: '';
    position: absolute;
    width: 200%; /* Más ancho para cubrir el movimiento */
    height: 200%;
    top: -50%;
    left: -50%;
    background-image: 
      radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 3px),
      radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 2px),
      radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 3px);
    background-size: 550px 550px, 350px 350px, 250px 250px;
    background-position: 0 0, 40px 60px, 130px 270px;
    z-index: 0;
    filter: blur(0.5px);
  }

  /* Capa 1 de estrellas (más lenta y tenue) */
  &::before {
    animation: ${starTravel} 120s linear infinite;
    opacity: 0.3;
  }

  /* Capa 2 de estrellas (más rápida y brillante, toque Cyan) */
  &::after {
    background-image: 
      radial-gradient(${theme.arkaAccent}, rgba(0, 229, 255, .2) 2px, transparent 3px);
    background-size: 400px 400px;
    animation: ${starTravel} 60s linear infinite;
    opacity: 0.2;
    filter: blur(1px);
  }
`;

// Chasis Externo con Branding ARKA ( Flota sobre el fondo animado )
export const CameraChassis = styled.div`
  position: relative;
  width: 85%;
  height: 80%;
  background: ${theme.arkaDark};
  background-image: 
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 20px 20px; /* Micro cuadrícula técnica en el chasis */
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  padding: 45px 20px 20px 20px;
  box-shadow: 0 50px 100px rgba(0,0,0,0.9);
  z-index: 10; /* Por encima del fondo animado */

  /* Logo ARKA */
  &::before {
    content: 'ARKA // DIGITAL SOLUTIONS';
    position: absolute;
    top: 15px;
    left: 20px;
    font-family: 'Orbitron', sans-serif;
    font-size: 11px;
    letter-spacing: 5px;
    color: ${theme.arkaSilver};
    text-shadow: 0 0 5px rgba(255,255,255,0.3);
  }

  /* Modelo de Hardware */
  &::after {
    content: 'ENGINE: ARKA-V1.2';
    position: absolute;
    top: 15px;
    right: 20px;
    font-family: 'Orbitron', sans-serif;
    font-size: 8px;
    color: ${theme.textDim};
    letter-spacing: 1px;
  }

  @media (max-width: 768px) {
    width: 95%;
    height: 75%;
    padding: 35px 10px 10px 10px;
  }
`;

export const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;
  border: 1px solid ${props => props.detected ? theme.arkaAccent : '#222'};
  transition: border-color 0.4s ease;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.8);

  /* Esquinas HUD con estilo ARKA y Animación de pulso */
  .hud-line {
    position: absolute;
    width: 35px;
    height: 35px;
    border: 2px solid ${theme.arkaAccent};
    z-index: 10;
    box-shadow: 0 0 10px ${theme.arkaAccentDim};
    /* Si detecta, pulsa intensamente. Si no, pulsa tenue. */
    animation: ${hudPulse} ${props => props.detected ? '2s' : '4s'} infinite ease-in-out;
    transition: opacity 0.3s;
  }
  .tl { top: 0; left: 0; border-right: none; border-bottom: none; }
  .tr { top: 0; right: 0; border-left: none; border-bottom: none; }
  .bl { bottom: 0; left: 0; border-right: none; border-top: none; }
  .br { bottom: 0; right: 0; border-left: none; border-top: none; }

  /* Línea láser de escaneo */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    width: 100%;
    height: 3px;
    background: ${theme.arkaAccent};
    box-shadow: 0 0 20px ${theme.arkaAccent}, 0 0 40px ${theme.arkaAccent};
    z-index: 12;
    animation: ${scanMove} 4s linear infinite;
  }
`;

export const ActionButton = styled.button`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 250;
  padding: 18px 45px;
  background: ${props => props.isComplete ? theme.arkaAccent : 'rgba(0,0,0,0.7)'};
  border: 1px solid ${theme.arkaAccent};
  color: ${props => props.isComplete ? '#000' : theme.arkaAccent};
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 3px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  backdrop-filter: blur(5px); /* Toque de cristal en el botón */

  &:hover {
    background: ${theme.arkaAccent};
    color: #000;
    box-shadow: 0 0 30px ${theme.arkaAccent}, 0 0 60px ${theme.arkaAccentDim};
    transform: translateX(-50%) translateY(-3px);
  }
`;

export const DataSidebar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 400px;
  height: 100%;
  background: ${theme.arkaGlass};
  border-right: 1px solid rgba(0, 229, 255, 0.2);
  padding: 60px 40px;
  z-index: 300;
  backdrop-filter: blur(30px); /* Desenfoque intenso para PC */
  transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  transition: transform 0.6s cubic-bezier(0.19, 1, 0.22, 1);

  @media (max-width: 768px) {
    width: 100%;
    height: 75vh;
    top: auto;
    bottom: 0;
    border-radius: 30px 30px 0 0;
    transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(100%)'};
  }

  h2 {
    font-family: 'Orbitron', sans-serif;
    color: #fff;
    font-size: 16px;
    letter-spacing: 3px;
    margin-bottom: 35px;
    display: flex;
    align-items: center;
    &::before { content: ''; width: 4px; height: 20px; background: ${theme.arkaAccent}; margin-right: 12px; box-shadow: 0 0 10px ${theme.arkaAccent}; }
  }

  .data-block {
    margin-bottom: 30px;
    label { font-size: 9px; color: ${theme.arkaAccent}; letter-spacing: 2px; display: block; margin-bottom: 7px; text-shadow: 0 0 5px ${theme.arkaAccentDim}; }
    span { font-family: 'Orbitron', sans-serif; font-size: 19px; color: #fff; font-weight: bold; }
    p { font-size: 11px; color: #999; margin-top: 10px; line-height: 1.7; font-family: 'Inter', sans-serif; }
  }
`;

export const CanvasOverlay = styled.canvas`
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 5;
  filter: brightness(1.1) contrast(1.1);
`;

// Agrega o actualiza estos estilos en tu archivo de componentes estilizados
export const ModalContainer = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr; // Desktop
  width: 100%;
  max-width: 1100px;
  background: #0a0a0a;
  border: 1px solid #00f7ff;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr; // Tablet y Phone
    height: 90vh;
    overflow-y: auto;
  }
`;

export const AnalysisImageWrapper = styled.div`
  position: relative;
  border-right: 1px solid #222;
  
  @media (max-width: 900px) {
    border-right: none;
    border-bottom: 1px solid #00f7ff;
    height: 300px; // Altura fija para que no ocupe toda la pantalla en móvil
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover; // Mantiene el rostro encuadrado
  }
`;

export const InfoSection = styled.div`
  padding: 40px;
  
  @media (max-width: 600px) {
    padding: 20px;
  }
`;

