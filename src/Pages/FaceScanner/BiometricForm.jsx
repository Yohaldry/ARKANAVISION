import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styled from 'styled-components';
import { IoChevronBackOutline, IoChevronForwardOutline, IoFingerPrintOutline } from 'react-icons/io5';

// Archivo de audio local del sistema
import formAudioFile from '../../assets/AUDIO/Form/audio1.mp3';

// IMPORTACIONES DESDE TU ARCHIVO DE ESTILOS NATIVO
import { 
  QuestionTitle, StyledInput, ActionButton, StepIndicator,
  RobotSupervisorHUD, MiniFaceChassis, MiniFacePlate, 
  MiniEyesRow, MiniCameraEye, MiniLens, MiniMouthRing
} from './UI/Biometricform.styles';

const QUESTIONS = [
  { id: 'nombre', label: 'Nombre y Apellido', placeholder: 'Ingrese identidad...', type: 'text' },
  { id: 'edad', label: 'Edad Cronológica', placeholder: 'Ej: 25', type: 'number' },
  { id: 'ocupacion', label: 'Actividad Profesional', placeholder: 'Ej: Desarrollador...', type: 'text' },
  { id: 'tipoCraneo', label: 'Morfología Craneal', placeholder: 'Ej: Mesocéfalo...', type: 'text' },
  { id: 'email', label: 'Enlace de Red (Email)', placeholder: 'usuario@arka.com', type: 'email' },
  { id: 'telefono', label: 'Canal de Contacto (Tel)', placeholder: '+57...', type: 'tel' }
];

/* ==========================================================================
   ESTILOS CONTROLADORES: VISARKA SPLASH GRADIENTE ULTRA-INMERSIVO
   ========================================================================== */

const ModalFormWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow: hidden;
  padding: 4px;
  background: #02040a;
`;

const VisarkaSplashContainer = styled(motion.div)`
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  z-index: 100;
  padding: 20px;
  box-sizing: border-box;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  background: 
    radial-gradient(circle at 50% 43%, rgba(0, 166, 255, 0.16) 0%, rgba(0, 73, 145, 0.05) 45%, transparent 70%),
    linear-gradient(180deg, #02050d 0%, #010205 100%);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 1px;
    height: 100%;
    background: linear-gradient(to bottom, 
      transparent 0%, 
      rgba(0, 229, 255, 0.03) 10%, 
      rgba(0, 229, 255, 0.35) 43%, 
      rgba(0, 229, 255, 0.03) 80%, 
      transparent 100%
    );
    box-shadow: 0 0 12px rgba(0, 229, 255, 0.4);
    pointer-events: none;
  }

  .logo-box-fused {
    position: relative;
    width: 130px;
    height: 130px;
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .brand-logo-central {
    width: 100%;
    height: 100%;
    object-fit: contain;
    mix-blend-mode: screen; 
    filter: brightness(1.1) contrast(1.05) drop-shadow(0 0 20px rgba(0, 229, 255, 0.45));
  }

  .logo-glow-back {
    position: absolute;
    width: 80px;
    height: 80px;
    background: radial-gradient(circle, rgba(0, 229, 255, 0.2) 0%, transparent 70%);
    filter: blur(8px);
    pointer-events: none;
    z-index: -1;
  }

  .brand-title {
    font-family: 'Sora', sans-serif;
    font-size: 32px;
    font-weight: 300;
    color: #ffffff;
    letter-spacing: 12px;
    margin: 16px 0 6px 12px;
    text-align: center;
    text-shadow: 0 0 15px rgba(255, 255, 255, 0.25);
    z-index: 2;
  }

  .brand-subtitle {
    font-family: 'Space Grotesk', monospace;
    font-size: 9px;
    color: #8fa0b5;
    letter-spacing: 5px;
    text-transform: uppercase;
    margin-bottom: 65px;
    opacity: 0.8;
    z-index: 2;
  }

  .loader-text {
    font-family: 'Space Grotesk', monospace;
    font-size: 11px;
    color: #00E5FF;
    letter-spacing: 4px;
    margin-bottom: 14px;
    font-weight: 500;
    text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
    z-index: 2;
  }

  .loader-track {
    width: 220px;
    height: 3px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    overflow: hidden;
    position: relative;
    margin-bottom: 50px;
    z-index: 2;
  }

  .loader-bar {
    height: 100%;
    background: linear-gradient(90deg, #00E5FF 0%, #8A2BE2 100%);
    box-shadow: 0 0 14px rgba(0, 229, 255, 0.7);
    width: 0%;
  }

  .footer-subtext {
    font-family: 'Inter', sans-serif;
    font-size: 9px;
    color: rgba(255, 255, 255, 0.25);
    letter-spacing: 2px;
    position: absolute;
    bottom: 24px;
    z-index: 2;
  }
`;

const FormHeaderHUD = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 229, 255, 0.15);
  margin-bottom: 12px;
  flex-shrink: 0;

  .brand-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #00E5FF;
    font-family: 'Sora', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
  }
`;

const RobotHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: rgba(10, 19, 34, 0.4);
  border: 1px solid rgba(0, 243, 255, 0.1);
  border-radius: 16px;
  padding: 10px 14px;
  margin-bottom: 14px;
  flex-shrink: 0;
  box-sizing: border-box;

  .logo-arka-nuevo {
    width: 90px;         
    height: 90px;        
    object-fit: contain;
    border-radius: 8px;  
    mix-blend-mode: screen; 
    filter: drop-shadow(0 0 8px rgba(0, 229, 255, 0.25));
  }
`;

const QuestionCardMobile = styled(motion.div)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  flex: 1; 
  width: 100%;
`;

const QuestionLabel = styled.div`
  font-family: 'Space Grotesk', monospace;
  font-size: 11px;
  color: #00E5FF;
  letter-spacing: 2px;
  opacity: 0.8;
`;

const NavButtonsMobile = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto; 
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
`;

const ResponsiveBackButton = styled.button`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #8B9CB6;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    color: #FFFFFF;
    background: rgba(255, 255, 255, 0.05);
  }
`;

/* ==========================================================================
   COMPONENTE PRINCIPAL BIOMETRICFORM
   ========================================================================== */
const BiometricForm = ({ onNextStep }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [hasStarted, setHasStarted] = useState(false); 
  const [loadingProgress, setLoadingProgress] = useState(0); 
  const [isLoadingComplete, setIsLoadingComplete] = useState(false); 

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationRef = useRef(null);

  // CONTROL ARREGLADO: Transición instantánea y forzada al llegar al 100%
  useEffect(() => {
    if (hasStarted && !isLoadingComplete) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          const nextProgress = prev + 4; // Incremento fluido
          if (nextProgress >= 100) {
            clearInterval(interval);
            setIsLoadingComplete(true); // Cambia el estado inmediatamente sin retrasos
            return 100;
          }
          return nextProgress;
        });
      }, 30);
      
      return () => clearInterval(interval);
    }
  }, [hasStarted, isLoadingComplete]);

  // Protocolo maestro de decodificación de audio
  const startArkaProtocol = async (e) => {
    if (e) e.stopPropagation();

    if (audioContextRef.current || isSpeaking || hasStarted) return;
    setHasStarted(true); 

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      const response = await fetch(formAudioFile);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyserRef.current = analyser;

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      sourceRef.current = source;

      source.connect(analyser);
      analyser.connect(ctx.destination);

      source.start(0);
      setIsSpeaking(true);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const update = () => {
        if (!analyserRef.current || !sourceRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const volume = (dataArray[5] + dataArray[10] + dataArray[15]) / 3;
        setVoiceLevel(volume);
        animationRef.current = requestAnimationFrame(update);
      };
      update();

      source.onended = () => {
        setIsSpeaking(false);
        setVoiceLevel(0);
        cancelAnimationFrame(animationRef.current);
      };

    } catch (err) {
      console.error("Error en el sistema de audio:", err);
      audioContextRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (sourceRef.current) try { sourceRef.current.stop(); } catch(e){}
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const handleNext = () => {
    if (!formData[QUESTIONS[currentStep].id]) return;

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      if (onNextStep) onNextStep();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNext();
    }
  };

  return (
    <ModalFormWrapper>
      
      {/* CAPA DE BLOQUEO TÁCTIL */}
      <AnimatePresence>
        {!hasStarted && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={startArkaProtocol} 
            onTouchStart={startArkaProtocol}
            style={{
              position: 'absolute',
              top: 0, left: 0, width: '100%', height: '100%',
              zIndex: 110, background: 'rgba(4, 7, 15, 0.99)', display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', backdropFilter: 'blur(10px)', borderRadius: '16px'
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1], borderColor: ['#00f3ff', '#0055ff', '#00f3ff'] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              style={{ 
                width: '85px', height: '85px', border: '2px solid #00f3ff', 
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 22px rgba(0, 243, 255, 0.3)', background: 'rgba(0,0,0,0.6)'
              }}
            >
              <div style={{ color: '#00f3ff', fontSize: '20px', fontWeight: 'bold', fontFamily: 'Sora, sans-serif' }}>タップ</div>
            </motion.div>
            <p style={{ color: '#00f3ff', marginTop: '22px', letterSpacing: '4px', fontSize: '10px', fontWeight: '600', fontFamily: 'Space Grotesk, monospace' }}>
              INICIAR SISTEMA ARKA
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PANTALLA DE CARGA CORPORATIVA HOLOGRÁFICA */}
      <AnimatePresence>
        {!isLoadingComplete && hasStarted && (
          <VisarkaSplashContainer
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "linear" }}
          >
            <div className="logo-box-fused">
              <div className="logo-glow-back" />
              <img 
                src="https://res.cloudinary.com/dtkirmtfq/image/upload/v1780018825/ARKA/d0pbmiqgu7bnzn4y93xh.jpg" 
                alt="Logo Visarka" 
                className="brand-logo-central"
              />
            </div>
            
            <h1 className="brand-title">VISARKA</h1>
            <p className="brand-subtitle">Inteligencia Facial de Precisión</p>

            <div className="loader-text">INICIANDO IA</div>
            <div className="loader-track">
              <div 
                className="loader-bar" 
                style={{ width: `${loadingProgress}%`, transition: 'width 30ms linear' }} 
              />
            </div>

            <div className="footer-subtext">by Arkana Visión</div>
          </VisarkaSplashContainer>
        )}
      </AnimatePresence>

      {/* DESPLIEGUE INMEDIATO DEL FORMULARIO */}
      {isLoadingComplete && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.2 }}
          style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          {/* 1. HUD Superior */}
          <FormHeaderHUD>
            <div className="brand-meta">
              <IoFingerPrintOutline size={13} />
              REGISTRO BIOMÉTRICO
            </div>
            <StepIndicator>
              DATA_SCAN // 0{currentStep + 1}
            </StepIndicator>
          </FormHeaderHUD>

          {/* 2. Sección del Nuevo Logo Integrado y HUD Robot Supervisor */}
          <RobotHeaderRow>
            <img 
              src="https://res.cloudinary.com/dtkirmtfq/image/upload/v1780018825/ARKA/d0pbmiqgu7bnzn4y93xh.jpg" 
              alt="Logo Visarka" 
              className="logo-arka-nuevo"
            />
            <RobotSupervisorHUD style={{ transform: 'scale(0.8)', transformOrigin: 'right center', margin: 0 }}>
              <MiniFaceChassis><MiniFacePlate /></MiniFaceChassis>
              <MiniEyesRow>
                <MiniCameraEye><MiniLens /></MiniCameraEye>
                <MiniCameraEye><MiniLens /></MiniCameraEye>
              </MiniEyesRow>
              <MiniMouthRing speaking={isSpeaking} amplitude={voiceLevel} />
            </RobotSupervisorHUD>
          </RobotHeaderRow>

          {/* 3. Bloque del Formulario Centrado */}
          <AnimatePresence mode="wait">
            <QuestionCardMobile
              key={currentStep}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              <QuestionLabel>
                SISTEMA DE ENTRADA // <span>0{currentStep + 1}</span>
              </QuestionLabel>
              
              <QuestionTitle style={{ fontSize: '18px', margin: 0, lineHeight: '1.3' }}>
                <span>ANALYZING:</span> <br />
                {QUESTIONS[currentStep].label}
              </QuestionTitle>

              <StyledInput 
                autoFocus
                type={QUESTIONS[currentStep].type}
                placeholder={QUESTIONS[currentStep].placeholder}
                value={formData[QUESTIONS[currentStep].id] || ''}
                onChange={(e) => setFormData({ ...formData, [QUESTIONS[currentStep].id]: e.target.value })}
                onKeyDown={handleKeyDown}
                style={{ fontSize: '16px', padding: '14px' }}
              />
            </QuestionCardMobile>
          </AnimatePresence>

          {/* 4. Botonera de Navegación */}
          <NavButtonsMobile>
            {currentStep > 0 && (
              <ResponsiveBackButton type="button" onClick={() => setCurrentStep(currentStep - 1)}>
                <IoChevronBackOutline size={18} />
              </ResponsiveBackButton>
            )}
            
            <ActionButton 
              primary 
              disabled={!formData[QUESTIONS[currentStep].id]} 
              onClick={handleNext}
              style={{ flex: 1, height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <span>{currentStep === QUESTIONS.length - 1 ? 'FINALIZAR' : 'CONFIRMAR PASO'}</span>
              <IoChevronForwardOutline size={16} />
            </ActionButton>
          </NavButtonsMobile>
        </motion.div>
      )}

    </ModalFormWrapper>
  );
};

export default BiometricForm;