import styled, { keyframes } from 'styled-components';

const theme = {
  arkaAccent: '#00E5FF',
  bg: '#020405',
  border: 'rgba(0, 229, 255, 0.2)',
};

// --- ANIMACIONES ---
const plateFloat = keyframes`
  70%, 40% { transform: translateY(0) scale(1.03); opacity: 0.8; }
  50% { transform: translateY(-5px) scale(1.01); opacity: 1; }
`;

const shutterBlink = keyframes`
  0%, 90%, 100% { transform: scaleY(1); opacity: 1; }
  95% { transform: scaleY(0.05); opacity: 0.5; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const logoSpin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// --- COMPONENTES DE LA INTERFAZ ---

export const WelcomeContainer = styled.div`
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

// ÚNICA DECLARACIÓN DE LOGOCONTAINER
export const LogoContainer = styled.div`
  position: absolute;
  top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${fadeIn} 1.2s ease-out;
  z-index: 15;
`;

export const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  border: 2px double ${theme.arkaAccent};
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: ${logoSpin} 8s linear infinite;
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.3);

  &::after {
    content: '';
    width: 12px;
    height: 12px;
    background: ${theme.arkaAccent};
    border-radius: 50%;
    box-shadow: 0 0 10px ${theme.arkaAccent};
  }
`;

export const LogoText = styled.div`
  text-align: center;
  .brand {
    font-family: 'Orbitron', sans-serif;
    font-size: 24px;
    font-weight: 900;
    letter-spacing: 12px;
    color: #fff;
    margin-right: -12px;
    span { color: ${theme.arkaAccent}; }
  }
  .slogan {
    font-size: 8px;
    letter-spacing: 6px;
    color: ${theme.arkaAccent};
    opacity: 0.5;
    text-transform: uppercase;
    margin-top: 5px;
  }
`;

// --- ROBOT CORE (TUS ESTILOS ORIGINALES) ---

export const RobotFaceContainer = styled.div`
  position: relative;
  width: 350px;
  height: 450px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const FaceChassis = styled.div`
  position: absolute;
  width: 70%;
  height: 60%;
  border-radius: 40% 40% 50% 50%;
  border: 1px solid rgba(0, 229, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const FacePlate = styled.div`
  position: absolute;
  width: 110%;
  height: 80%;
  border-left: 5px solid ${theme.arkaAccent};
  border-right: 5px solid ${theme.arkaAccent};
  border-radius: 70px;
  opacity: 0.5;
  filter: blur(1px);
  animation: ${plateFloat} 1s ease-in-out infinite;

  &::before {
    content: '';
    position: absolute;
    top: 20%; left: -10px;
    width: 18px; height: 60%;
    background: linear-gradient(to bottom, transparent, ${theme.arkaAccent}, transparent);
  }
`;

export const EyesRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 100px;
  z-index: 5;
`;

export const CameraEye = styled.div`
  position: relative;
  width: 45px;
  height: 45px;
  background: rgba(0, 0, 0, 0.8);
  border: 3px solid rgba(0, 229, 255, 0.4);
  border-radius: 20%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 30px rgba(0, 229, 255, 0.1);
  animation: ${shutterBlink} 3s infinite;
`;

export const Lens = styled.div`
  width: 55px;
  height: 35px;
  background: radial-gradient(circle, #00E5FF 0%, #002D33 100%);
  border-radius: 50%;
  box-shadow: 0 0 25px #00E5FF;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 6px; left: 8px;
    width: 10px; height: 10px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 50%;
    filter: blur(1px);
  }
`;

export const MouthRing = styled.div.attrs(props => ({
  style: {
    transform: `scale(${1 + (props.amplitude || 0) / 90})`,
    opacity: 0.2 + ((props.amplitude || 0) / 120),
    borderColor: (props.amplitude > 50) ? '#00E5FF' : 'rgba(0, 229, 255, 0.4)',
  },
}))`
  position: absolute;
  bottom: 80px;
  width: 70px;
  height: 70px;
  border: 2px solid ${theme.arkaAccent};
  border-radius: 30%;
  transition: all 0.08s ease-out;
  box-shadow: 0 0 20px ${theme.arkaAccent}, inset 0 0 20px ${theme.arkaAccent};
  z-index: 5;
`;

export const MainTitle = styled.h1`
  font-family: 'Orbitron', sans-serif;
  font-size: 2.2rem;
  color: #fff;
  text-align: center;
  margin-top: 20px;
  letter-spacing: 3px;
  z-index: 10;
  span { color: ${theme.arkaAccent}; }
`;

export const StartButton = styled.button`
  background: transparent;
  color: #fff;
  border: 1px solid ${theme.border};
  padding: 18px 60px;
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  letter-spacing: 5px;
  text-transform: uppercase;
  cursor: pointer;
  z-index: 10;
  transition: all 0.4s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: ${theme.arkaAccent};
    color: #000;
    box-shadow: 0 0 40px ${theme.arkaAccent};
    border-color: ${theme.arkaAccent};
  }
`;

export const FooterInfo = styled.div`
  position: absolute;
  bottom: 30px;
  font-size: 10px;
  color: rgba(255,255,255,0.15);
  letter-spacing: 4px;
  font-family: 'Orbitron';
`;