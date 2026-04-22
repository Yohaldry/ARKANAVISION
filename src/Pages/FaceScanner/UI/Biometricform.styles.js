import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const theme = {
  arkaAccent: '#00E5FF',
  bg: '#020405',
};

// --- TUS ANIMACIONES ORIGINALES DE WELCOME REUTILIZADAS ---
const plateFloat = keyframes`
  70%, 40% { transform: translateY(0) scale(1.03); opacity: 0.8; }
  50% { transform: translateY(-5px) scale(1.01); opacity: 1; }
`;

const shutterBlink = keyframes`
  0%, 90%, 100% { transform: scaleY(1); opacity: 1; }
  95% { transform: scaleY(0.05); opacity: 0.5; }
`;

// --- COMPONENTES DE LA PANTALLA ---

export const FormPageWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  background: ${theme.bg};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
`;

// ENCABEZADO EXTERNO (LOGO Y ROBOT SUPERVISOR ORIGINAL)
export const ExternalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px; /* Espacio entre logo y robot */
  margin-bottom: 40px; /* Espacio antes del cuadro de preguntas */
  z-index: 10;
`;

// --- MINIATURIZACIÓN DEL ROBOT HUD ORIGINAL ---

export const RobotSupervisorHUD = styled.div`
  position: relative;
  width: 120px; /* Tamaño solicitado (comparable al logo) */
  height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  filter: drop-shadow(0 0 10px ${theme.arkaAccent});
`;

export const MiniFaceChassis = styled.div`
  position: absolute;
  width: 70%;
  height: 60%;
  border-radius: 40% 40% 50% 50%;
  border: 1px solid rgba(0, 229, 255, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const MiniFacePlate = styled.div`
  position: absolute;
  width: 110%;
  height: 80%;
  border-left: 2px solid ${theme.arkaAccent};
  border-right: 2px solid ${theme.arkaAccent};
  border-radius: 20px;
  opacity: 0.5;
  filter: blur(1px);
  animation: ${plateFloat} 1s ease-in-out infinite;
`;

export const MiniEyesRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 30px;
  z-index: 5;
`;

export const MiniCameraEye = styled.div`
  position: relative;
  width: 18px;
  height: 18px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(0, 229, 255, 0.4);
  border-radius: 20%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.1);
  animation: ${shutterBlink} 3s infinite;
`;

export const MiniLens = styled.div`
  width: 22px;
  height: 14px;
  background: radial-gradient(circle, #00E5FF 0%, #002D33 100%);
  border-radius: 50%;
  box-shadow: 0 0 10px #00E5FF;
`;

// Boca original miniaturizada y preparada para el audio
export const MiniMouthRing = styled.div.attrs(props => ({
  style: {
    // Si la amplitud es 0 (cuando no habla), mantenemos un contorno suave
    transform: `scale(${1 + (props.amplitude || 0) / 90})`,
    opacity: props.speaking ? 0.3 + ((props.amplitude || 0) / 120) : 0.1,
    borderColor: (props.speaking && props.amplitude > 50) ? theme.arkaAccent : 'rgba(0, 229, 255, 0.4)',
  },
}))`
  position: absolute;
  bottom: 30px;
  width: 30px;
  height: 30px;
  border: 2px solid ${theme.arkaAccent};
  border-radius: 30%;
  transition: all 0.08s ease-out;
  box-shadow: 0 0 10px ${theme.arkaAccent}, inset 0 0 10px ${theme.arkaAccent};
  z-index: 5;
`;

// --- CUADRO DE PREGUNTAS (MINIMALISTA) ---
export const FormCard = styled(motion.div)`
  width: 90%;
  max-width: 450px;
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid rgba(0, 229, 255, 0.1);
  backdrop-filter: blur(15px);
  padding: 30px;
  border-radius: 15px;
  position: relative;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.6);
`;

export const StepIndicator = styled.div`
  position: absolute;
  top: 15px;
  right: 20px;
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  color: ${theme.arkaAccent};
  letter-spacing: 2px;
  opacity: 0.5;
`;

export const QuestionTitle = styled(motion.h2)`
  font-family: 'Orbitron', sans-serif;
  font-size: 16px;
  color: #fff;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 25px;
  line-height: 1.4;
  span { color: ${theme.arkaAccent}; }
`;

export const StyledInput = styled(motion.input)`
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 2px solid rgba(0, 229, 255, 0.2);
  padding: 12px 0;
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  outline: none;
  transition: all 0.4s ease;

  &:focus {
    border-bottom-color: ${theme.arkaAccent};
    box-shadow: 0 4px 10px -4px rgba(0, 229, 255, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.15);
    font-size: 0.85rem;
  }
`;

export const NavButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  gap: 10px;
`;

export const ActionButton = styled(motion.button)`
  flex: 1;
  padding: 10px;
  background: transparent;
  color: ${theme.arkaAccent};
  border: 1px solid ${theme.arkaAccent};
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 1px;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.3s;

  &:hover {
    background: ${theme.arkaAccent};
    color: #000;
    box-shadow: 0 0 15px ${theme.arkaAccent};
  }

  &:disabled {
    opacity: 0.2;
    cursor: not-allowed;
  }
`;